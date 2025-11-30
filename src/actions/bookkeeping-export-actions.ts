'use server'

import { prisma } from "@/lib/prisma"
import { getBookkeepingAccess } from "@/lib/bookkeeping-permissions"
import ExcelJS from 'exceljs'

export async function exportBookkeepingToExcel(
  bookkeepingId: string,
  startDate?: Date,
  endDate?: Date
) {
  const access = await getBookkeepingAccess(bookkeepingId)
  if (!access.canView) {
    throw new Error('Unauthorized')
  }

  const bookkeeping = await prisma.bookkeeping.findUnique({
    where: { id: bookkeepingId },
    include: { lembaga: true }
  })

  if (!bookkeeping) throw new Error('Bookkeeping not found')

  const where: any = { bookkeepingId }
  if (startDate && endDate) {
    where.date = {
      gte: startDate,
      lte: endDate
    }
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: { category: true },
    orderBy: { date: 'asc' }
  })

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Sistem Pondok'
  workbook.created = new Date()

  // Summary Sheet
  const summarySheet = workbook.addWorksheet('Ringkasan')
  
  summarySheet.columns = [
    { header: 'Keterangan', key: 'label', width: 30 },
    { header: 'Nilai', key: 'value', width: 20 },
  ]

  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0)

  summarySheet.addRows([
    { label: 'Nama Pembukuan', value: bookkeeping.name },
    { label: 'Lembaga', value: bookkeeping.lembaga?.name || '-' },
    { label: 'Periode Awal', value: startDate ? startDate.toLocaleDateString('id-ID') : 'Semua' },
    { label: 'Periode Akhir', value: endDate ? endDate.toLocaleDateString('id-ID') : 'Semua' },
    { label: '', value: '' },
    { label: 'Total Pemasukan', value: totalIncome },
    { label: 'Total Pengeluaran', value: totalExpense },
    { label: 'Saldo Akhir', value: totalIncome - totalExpense },
  ])

  // Style summary
  summarySheet.getRow(1).font = { bold: true }
  summarySheet.getCell('B6').numFmt = '#,##0'
  summarySheet.getCell('B7').numFmt = '#,##0'
  summarySheet.getCell('B8').numFmt = '#,##0'

  // Details Sheet
  const detailSheet = workbook.addWorksheet('Detail Transaksi')
  
  detailSheet.columns = [
    { header: 'Tanggal', key: 'date', width: 15 },
    { header: 'Tipe', key: 'type', width: 15 },
    { header: 'Kategori', key: 'category', width: 20 },
    { header: 'Deskripsi', key: 'description', width: 40 },
    { header: 'Referensi', key: 'reference', width: 15 },
    { header: 'Masuk', key: 'debit', width: 15 },
    { header: 'Keluar', key: 'credit', width: 15 },
    { header: 'Saldo', key: 'balance', width: 15 },
  ]

  let runningBalance = 0
  
  transactions.forEach(t => {
    const isIncome = t.type === 'INCOME'
    runningBalance += isIncome ? t.amount : -t.amount

    detailSheet.addRow({
      date: t.date,
      type: isIncome ? 'Pemasukan' : 'Pengeluaran',
      category: t.category.name,
      description: t.description,
      reference: t.reference || '-',
      debit: isIncome ? t.amount : 0,
      credit: !isIncome ? t.amount : 0,
      balance: runningBalance
    })
  })

  // Style details
  detailSheet.getRow(1).font = { bold: true }
  detailSheet.getColumn('debit').numFmt = '#,##0'
  detailSheet.getColumn('credit').numFmt = '#,##0'
  detailSheet.getColumn('balance').numFmt = '#,##0'
  detailSheet.getColumn('date').numFmt = 'dd/mm/yyyy'

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer()
  
  // Convert buffer to base64 string to pass to client
  return Buffer.from(buffer).toString('base64')
}

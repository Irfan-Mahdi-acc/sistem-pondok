'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getBookkeepingAccess } from "@/lib/bookkeeping-permissions"

// Get transactions for a specific bookkeeping
export async function getBookkeepingTransactions(
  bookkeepingId: string,
  month?: number,
  year?: number
) {
  const access = await getBookkeepingAccess(bookkeepingId)
  if (!access.canView) return []

  const where: any = { bookkeepingId }

  if (month && year) {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)
    where.date = {
      gte: startDate,
      lte: endDate,
    }
  } else if (year) {
    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year, 11, 31)
    where.date = {
      gte: startDate,
      lte: endDate,
    }
  }

  return await prisma.transaction.findMany({
    where,
    include: {
      category: true
    },
    orderBy: { date: 'desc' }
  })
}

// Create transaction in bookkeeping
export async function createBookkeepingTransaction(
  bookkeepingId: string,
  formData: FormData
) {
  const access = await getBookkeepingAccess(bookkeepingId)
  if (!access.canEdit) {
    return { success: false, error: 'Tidak memiliki izin untuk menambah transaksi' }
  }

  try {
    await prisma.transaction.create({
      data: {
        bookkeepingId,
        categoryId: formData.get('categoryId') as string,
        amount: parseFloat(formData.get('amount') as string),
        type: formData.get('type') as string,
        date: new Date(formData.get('date') as string),
        description: formData.get('description') as string,
        reference: formData.get('reference') as string || null,
        recordedBy: formData.get('recordedBy') as string || null,
      }
    })

    revalidatePath(`/dashboard/finance/bookkeeping/${bookkeepingId}`)
    return { success: true }
  } catch (error) {
    console.error('Create transaction error:', error)
    return { success: false, error: 'Gagal menambahkan transaksi' }
  }
}

// Update transaction
export async function updateBookkeepingTransaction(
  transactionId: string,
  bookkeepingId: string,
  formData: FormData
) {
  const access = await getBookkeepingAccess(bookkeepingId)
  if (!access.canEdit) {
    return { success: false, error: 'Tidak memiliki izin untuk mengedit transaksi' }
  }

  try {
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        categoryId: formData.get('categoryId') as string,
        amount: parseFloat(formData.get('amount') as string),
        type: formData.get('type') as string,
        date: new Date(formData.get('date') as string),
        description: formData.get('description') as string,
        reference: formData.get('reference') as string || null,
      }
    })

    revalidatePath(`/dashboard/finance/bookkeeping/${bookkeepingId}`)
    return { success: true }
  } catch (error) {
    console.error('Update transaction error:', error)
    return { success: false, error: 'Gagal mengupdate transaksi' }
  }
}

// Delete transaction
export async function deleteBookkeepingTransaction(
  transactionId: string,
  bookkeepingId: string
) {
  const access = await getBookkeepingAccess(bookkeepingId)
  if (!access.canEdit) {
    return { success: false, error: 'Tidak memiliki izin untuk menghapus transaksi' }
  }

  try {
    await prisma.transaction.delete({
      where: { id: transactionId }
    })

    revalidatePath(`/dashboard/finance/bookkeeping/${bookkeepingId}`)
    return { success: true }
  } catch (error) {
    console.error('Delete transaction error:', error)
    return { success: false, error: 'Gagal menghapus transaksi' }
  }
}

// Get bookkeeping summary
export async function getBookkeepingSummary(
  bookkeepingId: string,
  month?: number,
  year?: number
) {
  const access = await getBookkeepingAccess(bookkeepingId)
  if (!access.canView) return null

  const where: any = { bookkeepingId }

  if (month && year) {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)
    where.date = { gte: startDate, lte: endDate }
  } else if (year) {
    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year, 11, 31)
    where.date = { gte: startDate, lte: endDate }
  }

  const [income, expense, transactions] = await Promise.all([
    prisma.transaction.aggregate({
      where: { ...where, type: 'INCOME' },
      _sum: { amount: true },
      _count: true
    }),
    prisma.transaction.aggregate({
      where: { ...where, type: 'EXPENSE' },
      _sum: { amount: true },
      _count: true
    }),
    prisma.transaction.count({ where })
  ])

  const totalIncome = income._sum.amount || 0
  const totalExpense = expense._sum.amount || 0
  const balance = totalIncome - totalExpense

  return {
    totalIncome,
    totalExpense,
    balance,
    incomeCount: income._count,
    expenseCount: expense._count,
    totalTransactions: transactions
  }
}


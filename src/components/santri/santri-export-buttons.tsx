'use client'

import { Button } from "@/components/ui/button"
import { FileDown, FileSpreadsheet } from "lucide-react"
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

type Santri = {
  nis: string
  nisn: string | null
  nama: string
  gender: string
  status: string
  lembaga: { id?: string; nama: string }
  kelas: { nama: string } | null
  asrama: { nama: string } | null
  birthPlace: string | null
  birthDate: Date | null
  phone: string | null
  email: string | null
}

type ExportButtonsProps = {
  santriData: Santri[]
  disabled?: boolean
}

export function SantriExportButtons({ santriData, disabled }: ExportButtonsProps) {
  const exportToPDF = async () => {
    const doc = new jsPDF()
    
    // Get lembagaId from first santri (all should have same lembaga in filtered view)
    const lembagaId = santriData[0]?.lembaga?.id
    
    // Add professional header with logo and pondok name
    const { addPDFHeader } = await import('@/lib/pdf-header')
    const startY = await addPDFHeader(doc, {
      title: 'Data Santri',
      subtitle: `Total: ${santriData.length} santri`,
      date: `Tanggal: ${new Date().toLocaleDateString('id-ID')}`
    }, lembagaId)

    // Table
    autoTable(doc, {
      startY: startY,
      head: [['NIS', 'Nama', 'L/P', 'Lembaga', 'Kelas', 'Status']],
      body: santriData.map(s => [
        s.nis,
        s.nama,
        s.gender,
        s.lembaga.nama,
        s.kelas?.nama || '-',
        s.status
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    })

    doc.save(`santri-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Data Santri')

    // Set column widths and headers
    worksheet.columns = [
      { header: 'NIS', key: 'nis', width: 15 },
      { header: 'NISN', key: 'nisn', width: 18 },
      { header: 'Nama', key: 'nama', width: 30 },
      { header: 'L/P', key: 'gender', width: 8 },
      { header: 'Tempat Lahir', key: 'birthPlace', width: 20 },
      { header: 'Tanggal Lahir', key: 'birthDate', width: 15 },
      { header: 'Lembaga', key: 'lembaga', width: 20 },
      { header: 'Kelas', key: 'kelas', width: 15 },
      { header: 'Asrama', key: 'asrama', width: 20 },
      { header: 'Telepon', key: 'phone', width: 15 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Status', key: 'status', width: 12 },
    ]

    // Style header row
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF3B82F6' }
    }
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }

    // Add data rows
    santriData.forEach(s => {
      worksheet.addRow({
        nis: s.nis,
        nisn: s.nisn || '-',
        nama: s.nama,
        gender: s.gender,
        birthPlace: s.birthPlace || '-',
        birthDate: s.birthDate ? new Date(s.birthDate).toLocaleDateString('id-ID') : '-',
        lembaga: s.lembaga.nama,
        kelas: s.kelas?.nama || '-',
        asrama: s.asrama?.nama || '-',
        phone: s.phone || '-',
        email: s.email || '-',
        status: s.status
      })
    })

    // Generate and download
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, `santri-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={exportToPDF}
        disabled={disabled || santriData.length === 0}
      >
        <FileDown className="h-4 w-4 mr-2" />
        Export PDF
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={exportToExcel}
        disabled={disabled || santriData.length === 0}
      >
        <FileSpreadsheet className="h-4 w-4 mr-2" />
        Export Excel
      </Button>
    </div>
  )
}

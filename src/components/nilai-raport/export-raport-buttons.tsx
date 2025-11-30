'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, FileSpreadsheet, Loader2, Mail } from 'lucide-react'
import { exportRaportToExcel, generateBatchPDF } from '@/lib/export-utils'
import { exportRaportForMailMerge } from '@/lib/export-mail-merge'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'

interface ExportRaportButtonsProps {
  kelasName: string
  semester: string
  academicYear: string
  lembagaName: string
  lembagaId?: string
  students: any[]
  nilaiData: any[]
  ujianHifdzData: any[]
  categories: any[]
}

export function ExportRaportButtons({
  kelasName,
  semester,
  academicYear,
  lembagaName,
  lembagaId,
  students,
  nilaiData,
  ujianHifdzData,
  categories
}: ExportRaportButtonsProps) {
  const [isExportingExcel, setIsExportingExcel] = useState(false)
  const [isExportingMailMerge, setIsExportingMailMerge] = useState(false)
  const [isExportingPDF, setIsExportingPDF] = useState(false)
  const [pdfProgress, setPdfProgress] = useState(0)

  const handleExportExcel = () => {
    setIsExportingExcel(true)
    try {
      exportRaportToExcel(kelasName, semester, students, nilaiData, ujianHifdzData, categories)
    } catch (error) {
      console.error('Error exporting Excel:', error)
      alert('Gagal export Excel. Silakan coba lagi.')
    } finally {
      setIsExportingExcel(false)
    }
  }

  const handleExportMailMerge = () => {
    setIsExportingMailMerge(true)
    try {
      const result = exportRaportForMailMerge(
        kelasName,
        semester,
        academicYear,
        lembagaName,
        students,
        nilaiData,
        ujianHifdzData,
        categories
      )
      alert(`Mail Merge berhasil di-export!\n\nFile: ${result.fileName}\nTotal Santri: ${result.totalRecords}\nTotal Kolom: ${result.columns}`)
    } catch (error) {
      console.error('Error exporting mail merge:', error)
      alert('Gagal export mail merge. Silakan coba lagi.')
    } finally {
      setIsExportingMailMerge(false)
    }
  }

  const handleExportPDF = async () => {
    setIsExportingPDF(true)
    setPdfProgress(0)
    try {
      await generateBatchPDF(
        students,
        kelasName,
        semester,
        nilaiData,
        ujianHifdzData,
        categories,
        lembagaId,
        (current, total) => {
          setPdfProgress((current / total) * 100)
        }
      )
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Gagal export PDF. Silakan coba lagi.')
    } finally {
      setIsExportingPDF(false)
      setPdfProgress(0)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Excel Export Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={isExportingExcel || isExportingMailMerge || students.length === 0}
          >
            {isExportingExcel || isExportingMailMerge ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export Excel
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Pilih Format Export</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleExportMailMerge}>
            <Mail className="h-4 w-4 mr-2" />
            <div className="flex flex-col">
              <span className="font-medium">Mail Merge (Word)</span>
              <span className="text-xs text-muted-foreground">
                Untuk template raport Word
              </span>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleExportExcel}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            <div className="flex flex-col">
              <span className="font-medium">Excel Analisis</span>
              <span className="text-xs text-muted-foreground">
                6 sheet dengan statistik
              </span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* PDF Export */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportPDF}
        disabled={isExportingPDF || students.length === 0}
      >
        {isExportingPDF ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {pdfProgress > 0 && `${Math.round(pdfProgress)}%`}
          </>
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" />
            Cetak Semua PDF
          </>
        )}
      </Button>

      {isExportingPDF && pdfProgress > 0 && (
        <div className="w-32">
          <Progress value={pdfProgress} className="h-2" />
        </div>
      )}
    </div>
  )
}

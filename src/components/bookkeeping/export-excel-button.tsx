'use client'

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { FileSpreadsheet, Loader2 } from "lucide-react"
import { exportBookkeepingToExcel } from "@/actions/bookkeeping-export-actions"
import { toast } from "sonner"

interface ExportExcelButtonProps {
  bookkeepingId: string
  bookkeepingName: string
}

export function ExportExcelButton({ bookkeepingId, bookkeepingName }: ExportExcelButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()

  const handleExport = async () => {
    setIsLoading(true)
    try {
      const startDate = searchParams.get("startDate") 
        ? new Date(searchParams.get("startDate")!) 
        : undefined
      
      const endDate = searchParams.get("endDate") 
        ? new Date(searchParams.get("endDate")!) 
        : undefined

      const base64 = await exportBookkeepingToExcel(bookkeepingId, startDate, endDate)
      
      // Create download link
      const link = document.createElement('a')
      link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`
      link.download = `Pembukuan_${bookkeepingName}_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success("Berhasil mengexport data ke Excel")
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Gagal mengexport data")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleExport}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
      )}
      Export Excel
    </Button>
  )
}

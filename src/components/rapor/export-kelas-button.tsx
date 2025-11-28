"use client"

import { Button } from "@/components/ui/button"
import { FileSpreadsheet } from "lucide-react"
import type { RaporData } from "@/actions/rapor-actions"

interface ExportKelasButtonProps {
  data: RaporData[]
  kelasName: string
}

export function ExportKelasButton({ data, kelasName }: ExportKelasButtonProps) {
  const handleExport = async () => {
    try {
      const { exportKelasToExcel } = await import("@/lib/excel-export")

      // Get unique mapel list
      const mapelSet = new Set<string>()
      data.forEach(rapor => {
        rapor.nilaiPerMapel.forEach(mapel => {
          mapelSet.add(mapel.mapelName)
        })
      })
      const mapelList = Array.from(mapelSet).sort()

      // Transform data for export
      const exportData = {
        kelas: kelasName,
        santriList: data.map(rapor => ({
          nis: rapor.santri.nis,
          nama: rapor.santri.nama,
          nilaiPerMapel: rapor.nilaiPerMapel.map(m => ({
            mapelName: m.mapelName,
            rataRata: m.rataRata
          })),
          rataRataKeseluruhan: rapor.rataRataKeseluruhan,
          ranking: rapor.ranking
        })),
        mapelList
      }

      const filename = `Rapor_${kelasName.replace(/\s+/g, '_')}.xlsx`
      exportKelasToExcel(exportData, filename)
    } catch (error) {
      console.error("Gagal mengekspor kelas:", error)
      alert("Gagal export kelas. Silakan coba lagi.")
    }
  }

  return (
    <Button onClick={handleExport} variant="default">
      <FileSpreadsheet className="h-4 w-4 mr-2" />
      Export Kelas ke Excel
    </Button>
  )
}

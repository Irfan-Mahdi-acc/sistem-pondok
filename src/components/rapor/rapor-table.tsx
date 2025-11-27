"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, FileDown, TrendingUp, Award, FileSpreadsheet } from "lucide-react"
import Link from "next/link"
import type { RaporData } from "@/actions/rapor-actions"
import { exportRaporToExcel } from "@/lib/excel-export"

interface RaporTableProps {
  data: RaporData[]
  lembagaId: string
}

export function RaporTable({ data, lembagaId }: RaporTableProps) {
  const [sortBy, setSortBy] = useState<"nama" | "rata" | "ranking">("ranking")

  const sortedData = [...data].sort((a, b) => {
    switch (sortBy) {
      case "nama":
        return a.santri.nama.localeCompare(b.santri.nama)
      case "rata":
        return b.rataRataKeseluruhan - a.rataRataKeseluruhan
      case "ranking":
        return (a.ranking || 999) - (b.ranking || 999)
      default:
        return 0
    }
  })

  const getGradeColor = (score: number) => {
    if (score >= 90) return "text-green-600 dark:text-green-400"
    if (score >= 75) return "text-blue-600 dark:text-blue-400"
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getGradeBadge = (score: number) => {
    if (score >= 90) return <Badge variant="default" className="bg-green-600">A</Badge>
    if (score >= 75) return <Badge variant="default" className="bg-blue-600">B</Badge>
    if (score >= 60) return <Badge variant="default" className="bg-yellow-600">C</Badge>
    return <Badge variant="destructive">D</Badge>
  }

  const handleExportIndividual = (rapor: RaporData) => {
    const filename = `Rapor_${rapor.santri.nis}_${rapor.santri.nama.replace(/\s+/g, '_')}.xlsx`
    const exportData = {
      ...rapor,
      santri: {
        ...rapor.santri,
        kelas: rapor.santri.kelas?.name || null
      }
    }
    exportRaporToExcel(exportData, filename)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Urutkan:</span>
        <Button
          variant={sortBy === "ranking" ? "default" : "outline"}
          size="sm"
          onClick={() => setSortBy("ranking")}
        >
          <Award className="h-4 w-4 mr-1" />
          Ranking
        </Button>
        <Button
          variant={sortBy === "rata" ? "default" : "outline"}
          size="sm"
          onClick={() => setSortBy("rata")}
        >
          <TrendingUp className="h-4 w-4 mr-1" />
          Rata-rata
        </Button>
        <Button
          variant={sortBy === "nama" ? "default" : "outline"}
          size="sm"
          onClick={() => setSortBy("nama")}
        >
          Nama
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Rank</TableHead>
              <TableHead>NIS</TableHead>
              <TableHead>Nama Santri</TableHead>
              <TableHead>Kelas</TableHead>
              <TableHead className="text-center">Jumlah Mapel</TableHead>
              <TableHead className="text-center">Rata-rata</TableHead>
              <TableHead className="text-center">Grade</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((rapor) => (
              <TableRow key={rapor.santri.id}>
                <TableCell className="font-bold">
                  {rapor.ranking === 1 && (
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4 text-yellow-500" />
                      <span className="text-yellow-600 dark:text-yellow-400">1</span>
                    </div>
                  )}
                  {rapor.ranking === 2 && (
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">2</span>
                    </div>
                  )}
                  {rapor.ranking === 3 && (
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4 text-orange-500" />
                      <span className="text-orange-600 dark:text-orange-400">3</span>
                    </div>
                  )}
                  {rapor.ranking && rapor.ranking > 3 && (
                    <span className="text-muted-foreground">{rapor.ranking}</span>
                  )}
                </TableCell>
                <TableCell className="font-mono text-sm">{rapor.santri.nis}</TableCell>
                <TableCell className="font-medium">{rapor.santri.nama}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {rapor.santri.kelas?.name || "Tidak ada kelas"}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {rapor.nilaiPerMapel.length}
                </TableCell>
                <TableCell className="text-center">
                  <span className={`font-bold ${getGradeColor(rapor.rataRataKeseluruhan)}`}>
                    {rapor.rataRataKeseluruhan.toFixed(2)}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  {getGradeBadge(rapor.rataRataKeseluruhan)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/dashboard/academic/rapor/${lembagaId}/detail/${rapor.santri.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Detail
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleExportIndividual(rapor)}
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-1" />
                      Excel
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>Total: {data.length} santri</div>
        <div>
          Rata-rata kelas: {" "}
          <span className="font-bold">
            {(data.reduce((sum, r) => sum + r.rataRataKeseluruhan, 0) / data.length || 0).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  )
}

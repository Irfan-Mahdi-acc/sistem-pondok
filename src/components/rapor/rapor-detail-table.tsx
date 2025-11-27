"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight } from "lucide-react"
import { useState } from "react"

interface NilaiData {
  ujianId: string
  ujianName: string
  ujianType: string
  score: number
  date: Date
}

interface MapelData {
  mapelId: string
  mapelName: string
  mapelCode?: string | null
  nilaiList: NilaiData[]
  rataRata: number
}

interface RaporDetailTableProps {
  data: MapelData[]
}

export function RaporDetailTable({ data }: RaporDetailTableProps) {
  const [openMapel, setOpenMapel] = useState<string[]>([])

  const toggleMapel = (mapelId: string) => {
    setOpenMapel(prev =>
      prev.includes(mapelId)
        ? prev.filter(id => id !== mapelId)
        : [...prev, mapelId]
    )
  }

  const getGradeColor = (score: number) => {
    if (score >= 90) return "text-green-600 dark:text-green-400"
    if (score >= 75) return "text-blue-600 dark:text-blue-400"
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getUjianTypeBadge = (type: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      HARIAN: { label: "Harian", className: "bg-blue-500" },
      UTS: { label: "UTS", className: "bg-purple-500" },
      UAS: { label: "UAS", className: "bg-red-500" },
      LISAN: { label: "Lisan", className: "bg-green-500" },
      PRAKTEK: { label: "Praktek", className: "bg-orange-500" },
    }

    const variant = variants[type] || { label: type, className: "bg-gray-500" }
    return <Badge className={variant.className}>{variant.label}</Badge>
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    })
  }

  return (
    <div className="space-y-2">
      {data.map((mapel) => {
        const isOpen = openMapel.includes(mapel.mapelId)
        
        return (
          <Collapsible
            key={mapel.mapelId}
            open={isOpen}
            onOpenChange={() => toggleMapel(mapel.mapelId)}
          >
            <div className="border rounded-lg">
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between p-4 hover:bg-accent transition-colors">
                  <div className="flex items-center gap-3">
                    {isOpen ? (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div className="text-left">
                      <p className="font-bold">{mapel.mapelName}</p>
                      {mapel.mapelCode && (
                        <p className="text-xs text-muted-foreground font-mono">
                          {mapel.mapelCode}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Jumlah Ujian</p>
                      <p className="font-bold">{mapel.nilaiList.length}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Rata-rata</p>
                      <p className={`font-bold text-lg ${getGradeColor(mapel.rataRata)}`}>
                        {mapel.rataRata.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="border-t">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Ujian</TableHead>
                        <TableHead>Jenis</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead className="text-right">Nilai</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mapel.nilaiList
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((nilai) => (
                          <TableRow key={nilai.ujianId}>
                            <TableCell className="font-medium">{nilai.ujianName}</TableCell>
                            <TableCell>{getUjianTypeBadge(nilai.ujianType)}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(nilai.date)}
                            </TableCell>
                            <TableCell className="text-right">
                              <span className={`font-bold text-lg ${getGradeColor(nilai.score)}`}>
                                {nilai.score.toFixed(0)}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        )
      })}
    </div>
  )
}

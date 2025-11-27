"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Filter } from "lucide-react"

interface RaporFiltersProps {
  lembagaId: string
  kelasList: {
    id: string
    name: string
    level: string
    _count: {
      santris: number
    }
  }[]
  selectedKelasId?: string
}

export function RaporFilters({ lembagaId, kelasList, selectedKelasId }: RaporFiltersProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium">Filter Kelas</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/dashboard/academic/rapor/${lembagaId}`}>
            <Button 
              variant={!selectedKelasId ? "default" : "outline"}
              size="sm"
            >
              Semua Kelas
            </Button>
          </Link>
          {kelasList.map((kelas) => (
            <Link 
              key={kelas.id} 
              href={`/dashboard/academic/rapor/${lembagaId}?kelasId=${kelas.id}`}
            >
              <Button 
                variant={selectedKelasId === kelas.id ? "default" : "outline"}
                size="sm"
              >
                {kelas.name} ({kelas._count.santris} santri)
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

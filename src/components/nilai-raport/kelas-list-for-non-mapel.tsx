'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { getKelasByLembaga } from "@/actions/kelas-actions"

interface KelasListForNonMapelProps {
  lembagaId: string
  academicYearId: string
  semester: string
}

export function KelasListForNonMapel({ lembagaId, academicYearId, semester }: KelasListForNonMapelProps) {
  const [kelasList, setKelasList] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchKelas() {
      try {
        setIsLoading(true)
        const data = await getKelasByLembaga(lembagaId)
        setKelasList(data)
      } catch (error) {
        console.error("Failed to fetch kelas:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchKelas()
  }, [lembagaId])

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Memuat kelas...</p>
  }

  if (kelasList.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">Belum ada kelas di lembaga ini</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {kelasList.map((kelas) => (
        <Card key={kelas.id} className="hover:bg-accent transition-colors">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{kelas.name}</CardTitle>
              <Badge variant="outline">
                {kelas._count?.santris || 0} santri
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Link 
              href={`/dashboard/academic/nilai-raport/${lembagaId}/non-mapel/kelas/${kelas.id}?academicYearId=${academicYearId}&semester=${semester}`}
            >
              <Button className="w-full" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Input per Santri
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

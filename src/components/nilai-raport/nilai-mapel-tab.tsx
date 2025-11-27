"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getKelasByLembaga } from "@/actions/rapor-actions"

interface NilaiMapelTabProps {
  lembagaId: string
  academicYearId: string
  semester: string
}

export function NilaiMapelTab({ lembagaId, academicYearId, semester }: NilaiMapelTabProps) {
  const [kelasList, setKelasList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const data = await getKelasByLembaga(lembagaId)
      setKelasList(data)
      setLoading(false)
    }
    loadData()
  }, [lembagaId])

  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Memuat data kelas...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Nilai Ujian Mapel</CardTitle>
            <div className="text-sm text-muted-foreground">
              Semester {semester} - Tahun Akademik
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Pilih kelas untuk mengelola ujian dan input nilai mapel
          </p>

          {kelasList.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Belum ada kelas untuk lembaga ini</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {kelasList.map((kelas) => (
                <Link 
                  key={kelas.id} 
                  href={`/dashboard/academic/nilai-raport/${lembagaId}/mapel/${kelas.id}?academicYearId=${academicYearId}&semester=${semester}`}
                >
                  <Card className="hover:bg-accent cursor-pointer transition-colors">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{kelas.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {kelas._count?.santris || 0} santri
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

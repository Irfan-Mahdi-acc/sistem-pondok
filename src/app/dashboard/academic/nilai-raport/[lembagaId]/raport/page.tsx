import { getKelasByLembaga } from "@/actions/kelas-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, FileText } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default async function RaportPage({
  params,
  searchParams
}: {
  params: Promise<{ lembagaId: string }>
  searchParams: Promise<{ academicYearId?: string; semester?: string }>
}) {
  const { lembagaId } = await params
  const { academicYearId, semester } = await searchParams

  if (!academicYearId || !semester) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <p className="text-center text-muted-foreground">
            Pilih tahun akademik dan semester terlebih dahulu
          </p>
        </Card>
      </div>
    )
  }

  const kelasList = await getKelasByLembaga(lembagaId)

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/dashboard/academic/nilai-raport/${lembagaId}?academicYearId=${academicYearId}&semester=${semester}`}>
          <Button variant="ghost" size="sm" className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Lihat Raport</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pilih kelas untuk melihat raport santri • Semester {semester}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Kelas</CardTitle>
        </CardHeader>
        <CardContent>
          {kelasList.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Belum ada kelas di lembaga ini</p>
            </div>
          ) : (
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
                      href={`/dashboard/academic/nilai-raport/${lembagaId}/raport/${kelas.id}?academicYearId=${academicYearId}&semester=${semester}`}
                    >
                      <Button className="w-full" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Lihat Raport Kelas
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

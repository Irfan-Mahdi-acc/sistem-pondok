import { getSantriById } from "@/actions/santri-actions"
import { getSantriUjianRecords } from "@/actions/ujian-hifdz-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BookMarked } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { GradeInputDialog } from "@/components/academic/ujian-hifdz/grade-input-dialog"

export default async function SantriHifdzPage({
  params,
  searchParams
}: {
  params: Promise<{ santriId: string }>
  searchParams: Promise<{ from?: string; lembagaId?: string }>
}) {
  const { santriId } = await params
  const { from, lembagaId } = await searchParams

  const santriData = await getSantriUjianRecords(santriId)

  if (!santriData) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <p className="text-center text-muted-foreground">Santri tidak ditemukan</p>
        </Card>
      </div>
    )
  }

  const ujianList = santriData.tahfidzRecords || []
  
  // Determine back link based on where user came from
  const backLink = lembagaId 
    ? `/dashboard/academic/nilai-raport/${lembagaId}#hifdz`
    : "/dashboard/academic/tahfidz"

  return (
    <div className="space-y-6">
      <div>
        <Link href={backLink}>
          <Button variant="ghost" size="sm" className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Nilai Hafalan - {santriData.nama}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">NIS: {santriData.nis}</Badge>
              <Badge variant="secondary">{santriData.kelas?.name || 'Tidak ada kelas'}</Badge>
              {santriData.halqoh && (
                <Badge variant="outline">Halqoh: {santriData.halqoh.name}</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookMarked className="h-5 w-5" />
            <CardTitle>Riwayat Ujian Hifdz</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {ujianList.length === 0 ? (
            <div className="text-center py-8">
              <BookMarked className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Belum ada ujian hifdz</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Surat/Juz</TableHead>
                  <TableHead>Ayat</TableHead>
                  <TableHead className="text-center">Nilai</TableHead>
                  <TableHead>Penguji</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ujianList.map((ujian) => (
                  <TableRow key={ujian.id}>
                    <TableCell>
                      {format(new Date(ujian.date), 'dd MMM yyyy', { locale: id })}
                    </TableCell>
                    <TableCell className="font-medium">
                      {ujian.surah}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {ujian.ayatStart > 0 && ujian.ayatEnd > 0 
                        ? `${ujian.ayatStart}-${ujian.ayatEnd}`
                        : '-'
                      }
                    </TableCell>
                    <TableCell className="text-center">
                      {ujian.grade ? (
                        <Badge 
                          variant={
                            parseFloat(ujian.grade) >= 9 ? 'default' : 
                            parseFloat(ujian.grade) >= 7 ? 'secondary' : 
                            'destructive'
                          }
                          className="font-semibold"
                        >
                          {ujian.grade}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          Belum dinilai
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {ujian.ustadz?.user?.name || '-'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {ujian.note || '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <GradeInputDialog ujian={ujian} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      {ujianList.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Ujian
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ujianList.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Sudah Dinilai
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {ujianList.filter(u => u.grade !== null).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Belum Dinilai
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {ujianList.filter(u => u.grade === null).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Rata-rata Nilai
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {ujianList.filter(u => u.grade !== null).length > 0
                  ? (ujianList
                      .filter(u => u.grade !== null)
                      .reduce((sum, u) => sum + parseFloat(u.grade!), 0) / 
                      ujianList.filter(u => u.grade !== null).length
                    ).toFixed(1)
                  : '-'
                }
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

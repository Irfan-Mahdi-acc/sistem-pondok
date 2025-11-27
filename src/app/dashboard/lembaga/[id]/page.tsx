import { getLembagas, getLembagaById } from "@/actions/lembaga-actions"
import { getJadwalByLembaga, getJamPelajaranByLembaga } from "@/actions/jadwal-actions"
import { getUstadzList } from "@/actions/mapel-actions"
import { getKelasList } from "@/actions/kelas-actions"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { JadwalPelajaranTable } from "@/components/jadwal/jadwal-pelajaran-table"
import { AssignMudirDialog } from "@/components/lembaga/assign-mudir-dialog"
import { Badge } from "@/components/ui/badge"

export default async function LembagaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [lembaga, jadwals, jamPelajaran, ustadzList, kelasList] = await Promise.all([
    getLembagaById(id),
    getJadwalByLembaga(id),
    getJamPelajaranByLembaga(id),
    getUstadzList(),
    getKelasList()
  ])

  if (!lembaga) {
    notFound()
  }

  // Filter kelas for this lembaga
  const filteredKelas = kelasList.filter(k => k.lembagaId === id)

  return (
    <div className="space-y-6">
      {/* Mudir Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Mudir (Kepala Lembaga)</CardTitle>
          </div>
          <AssignMudirDialog 
            lembagaId={lembaga.id}
            currentMudirId={lembaga.mudirId}
            ustadzList={ustadzList}
          />
        </CardHeader>
        <CardContent>
          {lembaga.mudir ? (
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <span className="text-lg font-semibold text-primary">
                  {lembaga.mudir.user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <p className="font-medium">{lembaga.mudir.user?.name || 'Unnamed'}</p>
                <Badge variant="outline" className="mt-1">Mudir</Badge>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Belum ada mudir yang ditugaskan</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Kelas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lembaga._count.kelas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Santri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lembaga._count.santris}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kontak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">{lembaga.phone || '-'}</div>
            <div className="text-xs text-muted-foreground">{lembaga.email || '-'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alamat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">{lembaga.address || '-'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Jadwal Pelajaran Table with Filters */}
      <JadwalPelajaranTable 
        jadwals={jadwals}
        jamPelajaran={jamPelajaran}
        ustadzList={ustadzList}
        kelasList={filteredKelas}
        lembagaName={lembaga.name}
      />
    </div>
  )
}

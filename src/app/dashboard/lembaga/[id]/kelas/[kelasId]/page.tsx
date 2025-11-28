import { getKelasById } from "@/actions/kelas-actions"
import { getSantriList } from "@/actions/santri-actions"
import { getUstadzList } from "@/actions/ustadz-actions"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, UserCircle, GraduationCap } from "lucide-react"
import Link from "next/link"
import { KelasStudentList } from "@/components/kelas/kelas-student-list"
import { AssignKetuaKelasDialog } from "@/components/kelas/assign-ketua-kelas-dialog"
import { AssignWaliKelasDialog } from "@/components/kelas/assign-wali-kelas-dialog"

export default async function KelasDetailPage({
  params,
}: {
  params: { id: string; kelasId: string }
}) {
  const kelas = await getKelasById(params.kelasId)

  if (!kelas) {
    notFound()
  }

  // Get all santri in this lembaga for assignment
  const allSantri = await getSantriList()
  const lembagaSantri = allSantri.filter(s => s.lembagaId === kelas.lembagaId)

  // Get all ustadz for wali kelas assignment
  const allUstadzRaw = await getUstadzList()
  const allUstadz = allUstadzRaw.filter((u): u is typeof u & { user: NonNullable<typeof u.user> } => u.user !== null)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/lembaga/${params.id}/kelas`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Kelas {kelas.name}</h1>
            <p className="text-muted-foreground">{kelas.lembaga.name}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Santri</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kelas._count.santris}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ketua Kelas</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-sm">
                {kelas.ketuaKelas ? (
                  <span className="font-medium">{kelas.ketuaKelas.nama}</span>
                ) : (
                  <span className="text-muted-foreground">Belum ditentukan</span>
                )}
              </div>
              <AssignKetuaKelasDialog
                kelasId={kelas.id}
                currentKetuaId={kelas.ketuaKelasId}
                santriList={kelas.santris}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wali Kelas</CardTitle>
            <UserCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-sm">
                {kelas.waliKelas ? (
                  <span className="font-medium">{kelas.waliKelas.user?.name}</span>
                ) : (
                  <span className="text-muted-foreground">Belum ditentukan</span>
                )}
              </div>
              <AssignWaliKelasDialog
                kelasId={kelas.id}
                currentWaliId={kelas.waliKelasId}
                ustadzList={allUstadz}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Santri</CardTitle>
          <CardDescription>
            Kelola daftar santri di kelas ini
          </CardDescription>
        </CardHeader>
        <CardContent>
          <KelasStudentList
            kelasId={kelas.id}
            students={kelas.santris}
            availableStudents={lembagaSantri.filter(s => !s.kelasId || s.kelasId === kelas.id)}
          />
        </CardContent>
      </Card>
    </div>
  )
}

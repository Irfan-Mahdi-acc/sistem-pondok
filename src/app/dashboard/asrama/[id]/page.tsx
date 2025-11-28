import { getAsramaById } from "@/actions/asrama-actions"
import { getSantriList } from "@/actions/santri-actions"
import { getUstadzList } from "@/actions/ustadz-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, UserCheck, GraduationCap } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { AssignKetuaAsramaDialog } from "@/components/asrama/assign-ketua-asrama-dialog"
import { AssignMusyrifDialog } from "@/components/asrama/assign-musyrif-dialog"
import { AsramaSantriList } from "@/components/asrama/asrama-santri-list"

export default async function AsramaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [asrama, allSantri, allUstadz] = await Promise.all([
    getAsramaById(id),
    getSantriList(),
    getUstadzList()
  ])

  if (!asrama) {
    return <div>Asrama tidak ditemukan</div>
  }

  // Filter santri yang belum punya asrama atau yang gender-nya sesuai
  const availableSantri = allSantri.filter(s => 
    !s.asramaId && (asrama.gender === 'MIXED' || s.gender === asrama.gender)
  )

  // Filter santri yang ada di asrama ini untuk ketua asrama
  const asramaSantri = asrama.santris || []

  const occupancyRate = asrama.capacity > 0 
    ? Math.round((asramaSantri.length / asrama.capacity) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/asrama">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{asrama.name}</h1>
            <p className="text-muted-foreground">Detail dan Manajemen Asrama</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kapasitas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{asrama.capacity}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terisi</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{asramaSantri.length}</div>
            <p className="text-xs text-muted-foreground">{occupancyRate}% kapasitas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jenis Kelamin</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge>
              {asrama.gender === 'L' ? 'Laki-laki' : asrama.gender === 'P' ? 'Perempuan' : 'Campuran'}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alamat</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{asrama.address || '-'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Ketua Asrama & Musyrif */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              <CardTitle>Ketua Asrama</CardTitle>
            </div>
            <AssignKetuaAsramaDialog 
              asramaId={asrama.id}
              currentKetuaId={asrama.ketuaAsramaId}
              santriList={asramaSantri}
            />
          </CardHeader>
          <CardContent>
            {asrama.ketuaAsrama ? (
              <div>
                <p className="font-medium">{asrama.ketuaAsrama.nama}</p>
                <p className="text-sm text-muted-foreground">NIS: {asrama.ketuaAsrama.nis}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">Belum ditentukan</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              <CardTitle>Musyrif</CardTitle>
            </div>
            <AssignMusyrifDialog 
              asramaId={asrama.id}
              currentMusyrifId={asrama.musyrifId}
              ustadzList={allUstadz}
            />
          </CardHeader>
          <CardContent>
            {asrama.musyrif?.user ? (
              <div>
                <p className="font-medium">{asrama.musyrif.user.name}</p>
                <p className="text-sm text-muted-foreground">NIK: {asrama.musyrif.nik || '-'}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">Belum ditentukan</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Santri List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Santri</CardTitle>
        </CardHeader>
        <CardContent>
          <AsramaSantriList 
            asramaId={asrama.id}
            santriList={asramaSantri}
            availableSantri={availableSantri}
          />
        </CardContent>
      </Card>
    </div>
  )
}

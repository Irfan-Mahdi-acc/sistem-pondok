import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { HalqohSantriList } from "@/components/halqoh/halqoh-santri-list"

export default async function HalqohDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) {
    redirect('/login')
  }

  const { id } = await params

  // Fetch halqoh with santri
  const halqoh = await prisma.halqoh.findUnique({
    where: { id },
    include: {
      ustadz: {
        include: {
          user: true
        }
      },
      santris: {
        include: {
          lembaga: true,
          kelas: true
        }
      }
    }
  })

  if (!halqoh) {
    redirect('/dashboard/academic/halqoh')
  }

  // Get available santri (not in any halqoh)
  const availableSantri = await prisma.santri.findMany({
    where: {
      halqohId: null,
      status: 'ACTIVE'
    },
    include: {
      lembaga: true,
      kelas: true
    },
    orderBy: {
      nama: 'asc'
    }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/academic/halqoh">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{halqoh.name}</h1>
          <p className="text-muted-foreground">Detail Halqoh</p>
        </div>
      </div>

      {/* Halqoh Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Halqoh</CardTitle>
            <CardDescription>Detail informasi halqoh</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nama</p>
              <p className="text-base">{halqoh.name}</p>
            </div>
            
            {halqoh.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Deskripsi</p>
                <p className="text-base">{halqoh.description}</p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-muted-foreground">Ustadz</p>
              <p className="text-base">{halqoh.ustadz?.user?.name || 'Belum ditugaskan'}</p>
            </div>

            {halqoh.level && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Level</p>
                <p className="text-base">{halqoh.level}</p>
              </div>
            )}

            {halqoh.schedule && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Jadwal</p>
                <p className="text-base">{halqoh.schedule}</p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge variant={halqoh.status === 'ACTIVE' ? 'default' : 'secondary'}>
                {halqoh.status === 'ACTIVE' ? 'Aktif' : 'Tidak Aktif'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistik</CardTitle>
            <CardDescription>Informasi kapasitas dan santri</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Jumlah Santri</p>
              <p className="text-2xl font-bold">{halqoh.santris.length}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Kapasitas Maksimal</p>
              <p className="text-2xl font-bold">{halqoh.maxCapacity || 'Tidak Terbatas'}</p>
            </div>

            {halqoh.maxCapacity && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sisa Kuota</p>
                <p className="text-2xl font-bold">
                  {Math.max(0, halqoh.maxCapacity - halqoh.santris.length)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Santri List */}
      <Card>
        <CardHeader>
          <CardTitle>Santri Terdaftar</CardTitle>
          <CardDescription>
            Daftar santri yang terdaftar di halqoh ini
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HalqohSantriList 
            halqohId={id}
            enrolledSantri={halqoh.santris}
            availableSantri={availableSantri}
            maxCapacity={halqoh.maxCapacity}
          />
        </CardContent>
      </Card>
    </div>
  )
}

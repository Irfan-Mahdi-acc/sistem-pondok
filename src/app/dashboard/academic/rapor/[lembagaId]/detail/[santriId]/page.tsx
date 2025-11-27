import { getRaporBySantri } from "@/actions/rapor-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, FileDown, User, GraduationCap, TrendingUp } from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { RaporDetailTable } from "@/components/rapor/rapor-detail-table"

const RaporChart = dynamic(
  () => import("@/components/rapor/rapor-chart").then((mod) => mod.RaporChart),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[400px] items-center justify-center text-sm text-muted-foreground">
        Memuat grafik...
      </div>
    ),
  }
)

export default async function RaporDetailPage({
  params
}: {
  params: Promise<{ lembagaId: string; santriId: string }>
}) {
  const { lembagaId, santriId } = await params
  const raporData = await getRaporBySantri(santriId)

  const getGradeBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-green-600">A - Sangat Baik</Badge>
    if (score >= 75) return <Badge className="bg-blue-600">B - Baik</Badge>
    if (score >= 60) return <Badge className="bg-yellow-600">C - Cukup</Badge>
    return <Badge variant="destructive">D - Kurang</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/academic/rapor/${lembagaId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Kembali
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Detail Rapor Ujian</h1>
            <p className="text-sm text-muted-foreground">
              {raporData.santri.lembaga.name} - {raporData.santri.lembaga.jenjang}
            </p>
          </div>
        </div>
        <Button>
          <FileDown className="h-4 w-4 mr-2" />
          Export PDF
        </Button>
      </div>

      {/* Student Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informasi Santri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">NIS</p>
              <p className="font-mono font-bold">{raporData.santri.nis}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nama Lengkap</p>
              <p className="font-bold">{raporData.santri.nama}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Kelas</p>
              <Badge variant="outline" className="font-bold">
                {raporData.santri.kelas?.name || "Tidak ada kelas"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Jumlah Mata Pelajaran
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{raporData.nilaiPerMapel.length}</div>
            <p className="text-xs text-muted-foreground">
              Mata pelajaran yang diikuti
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Rata-rata Keseluruhan
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {raporData.rataRataKeseluruhan.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Dari semua mata pelajaran
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Predikat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-2">
              {getGradeBadge(raporData.rataRataKeseluruhan)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Grafik Nilai per Mata Pelajaran</CardTitle>
        </CardHeader>
        <CardContent>
          <RaporChart data={raporData.nilaiPerMapel} />
        </CardContent>
      </Card>

      {/* Detailed Grades Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Nilai per Mata Pelajaran</CardTitle>
        </CardHeader>
        <CardContent>
          <RaporDetailTable data={raporData.nilaiPerMapel} />
        </CardContent>
      </Card>
    </div>
  )
}

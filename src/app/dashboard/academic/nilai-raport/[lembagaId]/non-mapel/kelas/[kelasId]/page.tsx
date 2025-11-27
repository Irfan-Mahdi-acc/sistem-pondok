import { getKelasByIdWithSantri } from "@/actions/kelas-actions"
import { getLembagaCategories } from "@/actions/lembaga-category-actions"
import { getAllNilaiForClass } from "@/actions/nilai-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { PerStudentNonMapelForm } from "@/components/nilai-raport/per-student-non-mapel-form"

export default async function InputNilaiNonMapelKelasPage({
  params,
  searchParams
}: {
  params: Promise<{ lembagaId: string; kelasId: string }>
  searchParams: Promise<{ academicYearId?: string; semester?: string }>
}) {
  const { lembagaId, kelasId } = await params
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

  const [kelas, categoriesData, nilaiData] = await Promise.all([
    getKelasByIdWithSantri(kelasId),
    getLembagaCategories(lembagaId),
    getAllNilaiForClass(kelasId, academicYearId, semester)
  ])

  if (!kelas) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <p className="text-center text-muted-foreground">Kelas tidak ditemukan</p>
        </Card>
      </div>
    )
  }

  // Filter active students
  const students = kelas.santris?.filter(s => s.status === 'ACTIVE') || []

  if (students.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <Link href={`/dashboard/academic/nilai-raport/${lembagaId}?academicYearId=${academicYearId}&semester=${semester}`}>
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Input Nilai Non-Mapel - {kelas.name}</h1>
        </div>
        <Card className="p-6">
          <p className="text-center text-muted-foreground">
            Tidak ada santri aktif di kelas ini
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/dashboard/academic/nilai-raport/${lembagaId}?academicYearId=${academicYearId}&semester=${semester}`}>
          <Button variant="ghost" size="sm" className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Input Nilai Non-Mapel - {kelas.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {students.length} santri • Semester {semester}
        </p>
      </div>

      <PerStudentNonMapelForm
        students={students}
        categories={categoriesData.categories}
        grouped={categoriesData.grouped}
        existingNilai={nilaiData}
        lembagaId={lembagaId}
        academicYearId={academicYearId}
        semester={semester}
      />
    </div>
  )
}

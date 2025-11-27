import { getExamById } from "@/actions/exam-actions"
import { getSantriByKelas } from "@/actions/santri-actions"
import { getNilaiByExam } from "@/actions/nilai-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { NilaiInputForm } from "@/components/nilai-raport/nilai-input-form"

export default async function InputNilaiUjianPage({
  params,
  searchParams
}: {
  params: Promise<{ lembagaId: string; kelasId: string; examId: string }>
  searchParams: Promise<{ academicYearId?: string; semester?: string }>
}) {
  const { lembagaId, kelasId, examId } = await params
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

  const [exam, santriList, existingNilai] = await Promise.all([
    getExamById(examId),
    getSantriByKelas(kelasId),
    getNilaiByExam(examId)
  ])

  if (!exam) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <p className="text-center text-muted-foreground">Ujian tidak ditemukan</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href={`/dashboard/academic/nilai-raport/${lembagaId}/mapel/${kelasId}?academicYearId=${academicYearId}&semester=${semester}`}>
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Input Nilai - {exam.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{exam.mapel?.name}</Badge>
            <Badge variant="secondary">{exam.type}</Badge>
            <span className="text-sm text-muted-foreground">
              {new Date(exam.date).toLocaleDateString('id-ID')}
            </span>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Santri</CardTitle>
        </CardHeader>
        <CardContent>
          <NilaiInputForm
            examId={examId}
            santriList={santriList}
            existingNilai={existingNilai}
            academicYearId={academicYearId}
            semester={semester}
          />
        </CardContent>
      </Card>
    </div>
  )
}

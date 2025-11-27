import { getKelasByIdWithMapel } from "@/actions/kelas-actions"
import { getExamsByKelas } from "@/actions/exam-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, FileText, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { CreateExamDialog } from "@/components/exam/create-exam-dialog"

export default async function NilaiMapelKelasPage({
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

  const kelas = await getKelasByIdWithMapel(kelasId)
  const exams = await getExamsByKelas(kelasId, academicYearId, semester)

  if (!kelas) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <p className="text-center text-muted-foreground">Kelas tidak ditemukan</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href={`/dashboard/academic/nilai-raport/${lembagaId}?academicYearId=${academicYearId}&semester=${semester}`}>
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Ujian - {kelas.name}</h1>
          <p className="text-sm text-muted-foreground">
            Semester {semester} - Kelola ujian dan input nilai
          </p>
        </div>
        <CreateExamDialog 
          kelasId={kelasId}
          mapels={kelas.mapels || []}
          academicYearId={academicYearId}
          semester={semester}
        />
      </div>

      {exams.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="font-semibold">Belum Ada Ujian</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Buat ujian baru untuk semester ini
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {exams.map((exam) => (
            <Card key={exam.id} className="hover:bg-accent transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{exam.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{exam.mapel?.name}</Badge>
                      <Badge variant="secondary">{exam.type}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(exam.date).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  </div>
                  <Link 
                    href={`/dashboard/academic/nilai-raport/${lembagaId}/mapel/${kelasId}/${exam.id}?academicYearId=${academicYearId}&semester=${semester}`}
                  >
                    <Button>
                      <FileText className="h-4 w-4 mr-2" />
                      Input Nilai
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              {exam.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{exam.description}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

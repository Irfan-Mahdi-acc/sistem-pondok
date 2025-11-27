import { getLembagaById } from "@/actions/lembaga-actions"
import { getAcademicYearsByLembaga } from "@/actions/academic-year-actions"
import { getSemesterStatus } from "@/actions/semester-actions"
import { NilaiRaportTabs } from "@/components/nilai-raport/nilai-raport-tabs"
import { SemesterSelector } from "@/components/nilai-raport/semester-selector"
import { StartSemesterButton } from "@/components/nilai-raport/start-semester-button"
import { Card, CardContent } from "@/components/ui/card"
import { FileText } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function NilaiRaportLembagaPage({
  params,
  searchParams
}: {
  params: Promise<{ lembagaId: string }>
  searchParams: Promise<{ academicYearId?: string; semester?: string }>
}) {
  const { lembagaId } = await params
  const { academicYearId, semester } = await searchParams
  
  const [lembaga, academicYears] = await Promise.all([
    getLembagaById(lembagaId),
    getAcademicYearsByLembaga(lembagaId)
  ])

  if (!lembaga) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <p className="text-center text-muted-foreground">Lembaga tidak ditemukan</p>
        </Card>
      </div>
    )
  }

  if (academicYears.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Nilai & Raport - {lembaga.name}</h1>
            <p className="text-sm text-muted-foreground">
              {lembaga.jenjang || 'Tidak ada jenjang'}
            </p>
          </div>
        </div>

        <Card className="p-6">
          <div className="text-center space-y-4">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="font-semibold">Belum Ada Tahun Akademik</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Silakan buat tahun akademik terlebih dahulu di pengaturan akademik
              </p>
            </div>
            <Link href="/dashboard/academic/settings">
              <Button>Buat Tahun Akademik</Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  // Get active academic year as default
  const activeYear = academicYears.find(y => y.isActive)
  const selectedAcademicYearId = academicYearId || activeYear?.id || academicYears[0]?.id
  const selectedSemester = (semester || '1') as "1" | "2"

  // Get semester status if both are selected
  let semesterStatus = null
  let selectedAcademicYear = null
  if (selectedAcademicYearId && selectedSemester) {
    selectedAcademicYear = academicYears.find(y => y.id === selectedAcademicYearId)
    semesterStatus = await getSemesterStatus(
      lembagaId,
      selectedAcademicYearId,
      selectedSemester
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Nilai & Raport - {lembaga.name}</h1>
          <p className="text-sm text-muted-foreground">
            Input nilai ujian mapel, non-mapel, dan hifdz
          </p>
        </div>
        {selectedAcademicYearId && selectedSemester && (
          <Link href={`/dashboard/academic/nilai-raport/${lembagaId}/raport?academicYearId=${selectedAcademicYearId}&semester=${selectedSemester}`}>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Lihat Raport
            </Button>
          </Link>
        )}
      </div>

      <SemesterSelector 
        lembagaId={lembagaId}
        academicYears={academicYears}
        selectedAcademicYearId={selectedAcademicYearId}
        selectedSemester={selectedSemester}
      />

      {selectedAcademicYearId && selectedSemester && semesterStatus && (
        <StartSemesterButton
          lembagaId={lembagaId}
          academicYearId={selectedAcademicYearId}
          academicYearName={selectedAcademicYear?.name || ''}
          semester={selectedSemester}
          isActive={semesterStatus.isActive}
          oldDataCount={semesterStatus.totalRecords}
        />
      )}

      {selectedAcademicYearId && selectedSemester && (
        <NilaiRaportTabs 
          lembagaId={lembagaId}
          academicYearId={selectedAcademicYearId}
          semester={selectedSemester}
        />
      )}
    </div>
  )
}

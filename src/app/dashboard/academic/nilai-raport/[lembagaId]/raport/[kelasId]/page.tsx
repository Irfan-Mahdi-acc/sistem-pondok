import { getKelasByIdWithSantri } from "@/actions/kelas-actions"
import { getAllNilaiForClass, getUjianHifdzForClass } from "@/actions/nilai-actions"
import { getLembagaCategories } from "@/actions/lembaga-category-actions"
import { prisma } from "@/lib/prisma"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, FileText, BarChart3, MessageSquare } from "lucide-react"
import Link from "next/link"
import { RaportCard } from "@/components/nilai-raport/raport-card"
import { ComprehensiveRaport } from "@/components/nilai-raport/comprehensive-raport"
import { RaportStatistics } from "@/components/nilai-raport/raport-statistics"
import { RaportNotes } from "@/components/nilai-raport/raport-notes"
import { ExportRaportButtons } from "@/components/nilai-raport/export-raport-buttons"

export default async function RaportKelasPage({
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

  const [kelas, nilaiData, ujianHifdzData, categoriesData, academicYear, lembaga] = await Promise.all([
    getKelasByIdWithSantri(kelasId),
    getAllNilaiForClass(kelasId, academicYearId, semester),
    getUjianHifdzForClass(kelasId, academicYearId, semester),
    getLembagaCategories(lembagaId),
    prisma.academicYear.findUnique({ where: { id: academicYearId }, select: { name: true } }),
    prisma.lembaga.findUnique({ where: { id: lembagaId }, select: { name: true } })
  ])

  if (!kelas || !academicYear || !lembaga) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <p className="text-center text-muted-foreground">Data tidak ditemukan</p>
        </Card>
      </div>
    )
  }

  const students = kelas.santris || []

  // Calculate ranking based on average mapel scores
  const studentsWithRanking = students.map((student: any) => {
    const studentNilai = nilaiData.filter((n) => n.santriId === student.id)
    const mapelNilai = studentNilai.filter(n => n.category === 'UJIAN' || n.category === 'TUGAS')
    const average = mapelNilai.length > 0
      ? mapelNilai.reduce((sum, n) => sum + (n.score || 0), 0) / mapelNilai.length
      : 0
    
    return {
      ...student,
      average
    }
  }).sort((a: any, b: any) => b.average - a.average) // Sort by average descending

  // Assign ranking and generate raport number
  const lembagaCode = lembaga.name.substring(0, 3).toUpperCase()
  const rankedStudents = studentsWithRanking.map((student: any, index: number) => {
    const ranking = index + 1
    const raportNumber = `${academicYear.name}-${semester}-${lembagaCode}-${ranking.toString().padStart(3, '0')}`
    
    return {
      ...student,
      ranking,
      raportNumber
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/dashboard/academic/nilai-raport/${lembagaId}/raport?academicYearId=${academicYearId}&semester=${semester}`}>
          <Button variant="ghost" size="sm" className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Raport Kelas {kelas.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {students.length} santri • Semester {semester} • Tahun {academicYear.name}
            </p>
          </div>
          <ExportRaportButtons
            kelasName={kelas.name}
            semester={semester}
            academicYear={academicYear.name}
            lembagaName={lembaga.name}
            students={students}
            nilaiData={nilaiData}
            ujianHifdzData={ujianHifdzData}
            categories={categoriesData.categories}
          />
        </div>
      </div>

      {students.length === 0 ? (
        <Card className="p-6">
          <p className="text-center text-muted-foreground">
            Tidak ada santri di kelas ini
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {rankedStudents.map((student: any) => {
            const studentNilai = nilaiData.filter((n) => n.santriId === student.id)
            const studentUjianHifdz = ujianHifdzData.filter((h) => h.santriId === student.id)
            
            return (
              <Card key={student.id} className="p-6">
                <Tabs defaultValue="comprehensive" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="comprehensive" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Raport Lengkap
                    </TabsTrigger>
                    <TabsTrigger value="simple" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Raport Sederhana
                    </TabsTrigger>
                    <TabsTrigger value="statistics" className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Statistik
                    </TabsTrigger>
                    <TabsTrigger value="notes" className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Catatan
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="comprehensive" className="mt-6">
                    <ComprehensiveRaport
                      student={student}
                      nilaiData={studentNilai}
                      ujianHifdzData={studentUjianHifdz}
                      categories={categoriesData.categories}
                      academicYear={academicYear.name}
                      semester={semester}
                      kelasName={kelas.name}
                      lembagaName={lembaga.name}
                      ranking={student.ranking}
                      totalStudents={students.length}
                      raportNumber={student.raportNumber}
                    />
                  </TabsContent>

                  <TabsContent value="simple" className="mt-6">
                    <RaportCard
                      student={student}
                      nilaiData={studentNilai}
                      ujianHifdzData={studentUjianHifdz}
                      categories={categoriesData.categories}
                      academicYearId={academicYearId}
                      semester={semester}
                      kelasName={kelas.name}
                      ranking={student.ranking}
                      totalStudents={students.length}
                      raportNumber={student.raportNumber}
                    />
                  </TabsContent>

                  <TabsContent value="statistics" className="mt-6">
                    <RaportStatistics
                      nilaiData={studentNilai}
                      ujianHifdzData={studentUjianHifdz}
                      categories={categoriesData.categories}
                      ranking={student.ranking}
                      totalStudents={students.length}
                    />
                  </TabsContent>

                  <TabsContent value="notes" className="mt-6">
                    <RaportNotes
                      studentId={student.id}
                      studentName={student.nama}
                      nilaiData={studentNilai}
                      initialNotes={{
                        academicNotes: '',
                        behaviorNotes: '',
                        recommendations: ''
                      }}
                    />
                  </TabsContent>
                </Tabs>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

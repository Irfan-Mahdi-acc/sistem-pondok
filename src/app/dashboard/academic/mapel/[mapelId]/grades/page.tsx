import { getNonExamGradeInputData } from "@/actions/non-exam-grade-actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, BookOpen, GraduationCap } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { notFound } from "next/navigation"
import { NonExamGradeInputTable } from "@/components/nilai/non-exam-grade-input-table"

const CATEGORIES = [
  { value: "SIKAP", label: "Sikap", icon: "😊" },
  { value: "KEHADIRAN", label: "Kehadiran", icon: "📅" },
  { value: "PRAKTIK", label: "Praktik", icon: "🛠️" },
  { value: "TUGAS", label: "Tugas", icon: "📝" },
] as const

export default async function NonExamGradesPage({
  params,
  searchParams
}: {
  params: Promise<{ mapelId: string }>
  searchParams: Promise<{ category?: string }>
}) {
  const { mapelId } = await params
  const { category = "SIKAP" } = await searchParams

  try {
    // Fetch data for the selected category
    const data = await getNonExamGradeInputData(mapelId, category)

    const gradeCount = data.santriList.filter((s: any) => s.letterGrade !== null).length
    const totalSantri = data.santriList.length

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/academic/mapel">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Kembali
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Input Nilai Non-Ujian</h1>
              <p className="text-sm text-muted-foreground">
                Input nilai sikap, kehadiran, praktik, dan tugas
              </p>
            </div>
          </div>
        </div>

        {/* Mapel Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {data.mapel.name}
                </CardTitle>
                {data.mapel.code && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Kode: {data.mapel.code}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Status Nilai</p>
                <p className="text-2xl font-bold">
                  {gradeCount}/{totalSantri}
                </p>
                <Badge 
                  variant={gradeCount === totalSantri ? "default" : gradeCount > 0 ? "secondary" : "outline"}
                >
                  {gradeCount === totalSantri ? "Lengkap" : gradeCount > 0 ? "Sebagian" : "Belum Ada"}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Tabs for Different Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Kategori Penilaian
            </CardTitle>
            <CardDescription>
              Pilih kategori untuk input nilai. Format nilai: A (Sangat Baik), B (Baik), C (Cukup), D (Kurang), E (Sangat Kurang)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={category} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                {CATEGORIES.map((cat) => (
                  <TabsTrigger 
                    key={cat.value} 
                    value={cat.value}
                    asChild
                  >
                    <Link 
                      href={`/dashboard/academic/mapel/${mapelId}/grades?category=${cat.value}`}
                      className="flex items-center gap-2"
                    >
                      <span>{cat.icon}</span>
                      {cat.label}
                    </Link>
                  </TabsTrigger>
                ))}
              </TabsList>

              {CATEGORIES.map((cat) => (
                <TabsContent key={cat.value} value={cat.value} className="mt-6">
                  <NonExamGradeInputTable
                    mapelId={mapelId}
                    category={cat.value}
                    santriList={data.santriList}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Grade Legend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Keterangan Nilai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-600">A</Badge>
                <span>Sangat Baik (90-100)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-600">B</Badge>
                <span>Baik (80-89)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-yellow-600">C</Badge>
                <span>Cukup (70-79)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-orange-600">D</Badge>
                <span>Kurang (60-69)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-red-600">E</Badge>
                <span>Sangat Kurang (&lt;60)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    console.error("Error loading non-exam grades page:", error)
    notFound()
  }
}

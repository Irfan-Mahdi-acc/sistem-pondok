import { getClassesForPromotion, getUnprocessedStudents, getPromotionHistory } from "@/actions/class-promotion-actions"
import { getAcademicYears, getActiveAcademicYear } from "@/actions/academic-year-actions"
import { getLembagas } from "@/actions/lembaga-actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GraduationCap, Users, ArrowRight, AlertCircle } from "lucide-react"
import { ClassPromotionManager } from "@/components/academic/class-promotion-manager"

export default async function KenaikanKelasPage() {
  const [classes, academicYears, lembagaList, activeYear] = await Promise.all([
    getClassesForPromotion(),
    getAcademicYears(),
    getLembagas(),
    getActiveAcademicYear()
  ])

  // Get unprocessed students for current academic year
  const unprocessedStudents = activeYear 
    ? await getUnprocessedStudents(activeYear.name)
    : []

  // Get promotion history for current year
  const history = activeYear 
    ? await getPromotionHistory(activeYear.name)
    : []

  // Calculate statistics
  const totalStudents = classes.reduce((sum, k) => sum + k.santris.length, 0)
  const classesWithNextClass = classes.filter(k => k.nextKelasId).length
  const terminalClasses = classes.filter(k => !k.nextKelasId).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kenaikan Kelas</h1>
          <p className="text-muted-foreground">
            Kelola proses kenaikan kelas santri setiap akhir tahun ajaran
          </p>
        </div>
        {activeYear && (
          <Badge variant="outline" className="text-lg px-4 py-2">
            Tahun Ajaran: {activeYear.name}
          </Badge>
        )}
      </div>

      {!activeYear && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Belum ada tahun ajaran aktif. Silakan aktifkan tahun ajaran di menu Pengaturan Akademik terlebih dahulu.
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Santri Aktif</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Di semua kelas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Belum Diproses</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{unprocessedStudents.length}</div>
            <p className="text-xs text-muted-foreground">
              Perlu kenaikan kelas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kelas Lanjutan</CardTitle>
            <ArrowRight className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classesWithNextClass}</div>
            <p className="text-xs text-muted-foreground">
              Memiliki kelas tujuan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kelas Akhir</CardTitle>
            <GraduationCap className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{terminalClasses}</div>
            <p className="text-xs text-muted-foreground">
              Kelas kelulusan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Promotion Manager */}
      <Card>
        <CardHeader>
          <CardTitle>Proses Kenaikan Kelas</CardTitle>
          <CardDescription>
            Pilih kelas dan proses kenaikan santri ke kelas berikutnya. Santri di kelas akhir akan menjadi alumni.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClassPromotionManager 
            classes={classes}
            academicYears={academicYears}
            lembagaList={lembagaList}
            activeYear={activeYear}
            unprocessedStudents={unprocessedStudents}
            history={history}
          />
        </CardContent>
      </Card>
    </div>
  )
}


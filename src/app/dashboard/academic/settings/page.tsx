import { getAcademicYears } from "@/actions/academic-year-actions"
import { getLembagas } from "@/actions/lembaga-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AddAcademicYearDialog } from "@/components/academic/add-academic-year-dialog"
import AcademicYearsList from "@/components/academic/academic-years-list"

export default async function AcademicSettingsPage() {
  const [academicYears, lembagaList] = await Promise.all([
    getAcademicYears(),
    getLembagas()
  ])

  const activeYear = academicYears.find(y => y.isActive)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Academic Year Settings</h1>
        <AddAcademicYearDialog lembagaList={lembagaList} />
      </div>

      {activeYear && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-lg">Active Academic Year</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold">{activeYear.name}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(activeYear.startDate).toLocaleDateString('id-ID')} - {new Date(activeYear.endDate).toLocaleDateString('id-ID')}
              </p>
              {activeYear.lembaga && (
                <p className="text-sm">Institution: {activeYear.lembaga.name}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Academic Years</CardTitle>
        </CardHeader>
        <CardContent>
          <AcademicYearsList academicYears={academicYears} />
        </CardContent>
      </Card>
    </div>
  )
}

import { getHalqohList } from "@/actions/halqoh-actions"
import { getAllInstructors } from "@/actions/instructor-actions"
import HalqohTable from "@/components/halqoh/halqoh-table"
import { AddHalqohDialog } from "@/components/halqoh/add-halqoh-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function HalqohPage() {
  const [halqohList, instructorList] = await Promise.all([
    getHalqohList(),
    getAllInstructors()
  ])

  const stats = {
    total: halqohList.length,
    withUstadz: halqohList.filter(h => h.ustadzId).length,
    totalStudents: halqohList.reduce((sum, h) => sum + h._count.santris, 0),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manajemen Halqoh</h1>
        <AddHalqohDialog instructorList={instructorList} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Halqoh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dengan Pembimbing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withUstadz}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Santri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
          </CardContent>
        </Card>
      </div>

      <HalqohTable halqohList={halqohList} instructorList={instructorList} />
    </div>
  )
}

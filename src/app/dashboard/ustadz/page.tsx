import { getUstadzList } from "@/actions/ustadz-actions"
import { getUsersWithoutUstadzProfile } from "@/actions/ustadz-actions"
import UstadzTable from "@/components/ustadz/ustadz-table"
import { AddUstadzDialog } from "@/components/ustadz/add-ustadz-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function UstadzPage() {
  const [ustadzList, availableUsers] = await Promise.all([
    getUstadzList(),
    getUsersWithoutUstadzProfile()
  ])

  const stats = {
    total: ustadzList.length,
    active: ustadzList.filter(u => u.status === 'ACTIVE').length,
    totalSubjects: ustadzList.reduce((sum, u) => sum + u._count.mapels, 0),
    totalHalqoh: ustadzList.reduce((sum, u) => sum + u._count.halqohs, 0),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manajemen Ustadz</h1>
        <AddUstadzDialog availableUsers={availableUsers} />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ustadz</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tugas Mapel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubjects}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kelompok Halqoh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHalqoh}</div>
          </CardContent>
        </Card>
      </div>

      <UstadzTable ustadzList={ustadzList} />
    </div>
  )
}

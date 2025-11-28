import { getTahfidzRecords } from "@/actions/tahfidz-actions"
import { getHalqohList } from "@/actions/halqoh-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AddTahfidzDialog } from "@/components/tahfidz/add-tahfidz-dialog"
import TahfidzTable from "@/components/tahfidz/tahfidz-table"

// Force dynamic rendering to prevent build-time database access
export const dynamic = 'force-dynamic'

export default async function TahfidzPage() {
  const [records, halqohList] = await Promise.all([
    getTahfidzRecords(),
    getHalqohList()
  ])

  const stats = {
    total: records.length,
    setoran: records.filter(r => r.type === 'SETORAN').length,
    murojaah: records.filter(r => r.type === 'MUROJAAH').length,
    tasmi: records.filter(r => r.type === 'TASMI').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tahfidz Tracking</h1>
        <AddTahfidzDialog halqohList={halqohList} />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Setoran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.setoran}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Murojaah</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.murojaah}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasmi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tasmi}</div>
          </CardContent>
        </Card>
      </div>

      <TahfidzTable records={records} />
    </div>
  )
}

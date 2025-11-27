import { getAsramaList } from "@/actions/asrama-actions"
import AsramaTable from "@/components/asrama/asrama-table"
import { AddAsramaDialog } from "@/components/asrama/add-asrama-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AsramaPage() {
  const asramaList = await getAsramaList()

  const stats = {
    total: asramaList.length,
    totalCapacity: asramaList.reduce((sum, a) => sum + a.capacity, 0),
    totalOccupied: asramaList.reduce((sum, a) => sum + a._count.santris, 0),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manajemen Asrama</h1>
        <AddAsramaDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Asrama</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Kapasitas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCapacity}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terisi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOccupied}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalCapacity > 0 
                ? `${Math.round((stats.totalOccupied / stats.totalCapacity) * 100)}% kapasitas`
                : '0% kapasitas'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      <AsramaTable asramaList={asramaList} />
    </div>
  )
}

import { getAssets, getAssetStats } from "@/actions/inventaris-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AddAssetDialog } from "@/components/inventaris/add-asset-dialog"
import { AssetTable } from "@/components/inventaris/asset-table"
import { Package, CheckCircle, AlertTriangle, XCircle } from "lucide-react"

export default async function InventarisPage() {
  const [assets, stats] = await Promise.all([
    getAssets(),
    getAssetStats()
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventaris</h1>
          <p className="text-muted-foreground">
            Kelola inventaris barang dan aset pondok
          </p>
        </div>
        <AddAssetDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Aset</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kondisi Baik</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.good}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rusak</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.damaged}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hilang</CardTitle>
            <XCircle className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.lost}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Aset</CardTitle>
        </CardHeader>
        <CardContent>
          <AssetTable assets={assets} />
        </CardContent>
      </Card>
    </div>
  )
}

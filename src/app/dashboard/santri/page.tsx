import { getSantriList } from "@/actions/santri-actions"
import { getLembagas } from "@/actions/lembaga-actions"
import { getKelasList } from "@/actions/kelas-actions"
import { AddSantriDialog } from "@/components/santri/add-santri-dialog"
import { BulkImportSantriDialog } from "@/components/santri/bulk-import-santri-dialog"
import { SantriListWrapper } from "@/components/santri/santri-list-wrapper"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function SantriPage() {
  const [santriList, lembagas, kelasList] = await Promise.all([
    getSantriList(),
    getLembagas(),
    getKelasList()
  ])

  const stats = {
    total: santriList.length,
    active: santriList.filter(s => s.status === 'ACTIVE').length,
    graduated: santriList.filter(s => s.status === 'GRADUATED').length,
    male: santriList.filter(s => s.gender === 'L').length,
    female: santriList.filter(s => s.gender === 'P').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manajemen Santri</h1>
        <div className="flex gap-2">
          <BulkImportSantriDialog lembagas={lembagas} kelasList={kelasList} />
          <AddSantriDialog lembagas={lembagas} kelasList={kelasList} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Santri</CardTitle>
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
            <CardTitle className="text-sm font-medium">Alumni</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.graduated}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Laki-laki</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.male}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Perempuan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.female}</div>
          </CardContent>
        </Card>
      </div>

      <SantriListWrapper
        initialSantri={santriList}
        lembagas={lembagas}
        kelasList={kelasList}
      />
    </div>
  )
}

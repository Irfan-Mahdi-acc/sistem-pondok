import { Metadata } from 'next'
import { getMusyrifList } from '@/actions/musyrif-actions'
import { MusyrifTable } from '@/components/musyrif/musyrif-table'
import { AddMusyrifDialog } from '@/components/musyrif/add-musyrif-dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Musyrif | Pondok Management',
  description: 'Kelola data musyrif (pembina asrama)',
}

export default async function MusyrifPage() {
  const musyrifList = await getMusyrifList()

  const stats = {
    total: musyrifList.length,
    active: musyrifList.filter(m => m.status === 'ACTIVE').length,
    linked: musyrifList.filter(m => !m.user.username.startsWith('temp_')).length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Musyrif</h1>
          <p className="text-muted-foreground">
            Kelola data musyrif (pembina asrama)
          </p>
        </div>
        <AddMusyrifDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Musyrif</CardTitle>
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
            <CardTitle className="text-sm font-medium">Terhubung ke User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.linked}</div>
          </CardContent>
        </Card>
      </div>

      <MusyrifTable musyrifList={musyrifList} />
    </div>
  )
}

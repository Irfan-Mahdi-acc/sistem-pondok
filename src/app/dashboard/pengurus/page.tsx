import { Metadata } from 'next'
import { getPengurusList } from '@/actions/pengurus-actions'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { PengurusTable } from '@/components/pengurus/pengurus-table'
import { AddPengurusDialog } from '@/components/pengurus/add-pengurus-dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Pengurus | Pondok Management',
  description: 'Kelola data pengurus pondok',
}

export default async function PengurusPage() {
  const pengurusList = await getPengurusList()

  const stats = {
    total: pengurusList.length,
    active: pengurusList.filter(p => p.status === 'ACTIVE').length,
    linked: pengurusList.filter(p => !p.user.username.startsWith('temp_')).length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pengurus</h1>
          <p className="text-muted-foreground">
            Kelola data pengurus dan administrator pondok
          </p>
        </div>
        <AddPengurusDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengurus</CardTitle>
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

      <PengurusTable pengurusList={pengurusList} />
    </div>
  )
}

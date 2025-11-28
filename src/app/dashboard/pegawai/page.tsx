import { Metadata } from 'next'
import { getAllStaff } from '@/actions/staff-actions'
import { StaffTable } from '@/components/pegawai/staff-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserCircle, Shield, Building2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Dashboard Pegawai | Pondok Management',
  description: 'Overview semua pegawai pondok',
}

export default async function PegawaiPage() {
  const staffList = await getAllStaff()

  const stats = {
    total: staffList.length,
    ustadz: staffList.filter(s => s.user && s.user.role === 'USTADZ').length,
    pengurus: staffList.filter(s => s.user && s.user.role === 'PENGURUS').length,
    musyrif: staffList.filter(s => s.user && s.user.role === 'MUSYRIF').length,
    active: staffList.filter(s => s.status === 'ACTIVE').length,
    linked: staffList.filter(s => s.user && !s.user.username.startsWith('temp_')).length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Pegawai</h1>
        <p className="text-muted-foreground">
          Overview semua pegawai pondok (Ustadz, Pengurus, Musyrif)
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pegawai</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Semua staff pondok
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ustadz</CardTitle>
            <UserCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ustadz}</div>
            <p className="text-xs text-muted-foreground">
              Tenaga pengajar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pengurus</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pengurus}</div>
            <p className="text-xs text-muted-foreground">
              Administrator
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Musyrif</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.musyrif}</div>
            <p className="text-xs text-muted-foreground">
              Pembina asrama
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              Pegawai aktif
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terhubung ke User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.linked}</div>
            <p className="text-xs text-muted-foreground">
              Memiliki akun login
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Staff Table */}
      <StaffTable staffList={staffList} />
    </div>
  )
}

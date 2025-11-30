import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getPSBPeriods, getPSBRegistrations } from "@/actions/psb-actions"

export default async function PSBPage() {
  const periods = await getPSBPeriods()
  const registrations = await getPSBRegistrations()
  
  // Calculate stats
  const totalRegistrations = registrations.length
  const activePeriod = periods.find(p => p.isActive)
  const acceptedCount = registrations.filter(r => r.status === 'ACCEPTED').length
  const pendingCount = registrations.filter(r => r.status === 'PENDING').length

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendaftar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRegistrations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diterima</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{acceptedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menunggu Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gelombang Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePeriod ? activePeriod.name : 'Tidak ada'}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

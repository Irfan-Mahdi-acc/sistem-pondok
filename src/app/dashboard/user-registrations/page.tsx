import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserApprovalTable } from "@/components/admin/user-approval-table"
import { Users, Clock } from "lucide-react"

export default async function UserRegistrationsPage() {
  const pendingUsers = await prisma.user.findMany({
    where: {
      OR: [
        { isApproved: false },
        { role: 'PENDING' }
      ]
    },
    orderBy: {
      createdAt: 'desc'
    },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      role: true,
      isApproved: true,
      createdAt: true,
      emailVerified: true,
      accounts: {
        select: {
          provider: true
        }
      }
    }
  })

  const stats = {
    total: pendingUsers.length,
    google: pendingUsers.filter(u => u.accounts.some(a => a.provider === 'google')).length,
    credentials: pendingUsers.filter(u => u.accounts.length === 0).length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pendaftaran Akun Baru</h1>
        <p className="text-muted-foreground">
          Kelola dan setujui pendaftaran akun baru
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Via Google</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.google}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Via Web</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.credentials}</div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pendaftaran</CardTitle>
          <CardDescription>
            User yang menunggu persetujuan dan assignment role/lembaga
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserApprovalTable users={pendingUsers} />
        </CardContent>
      </Card>
    </div>
  )
}

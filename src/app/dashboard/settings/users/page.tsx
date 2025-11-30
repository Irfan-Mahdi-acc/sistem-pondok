import { prisma } from "@/lib/prisma"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserApprovalTable } from "@/components/admin/user-approval-table"
import { Users, Clock, CheckCircle2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"

export default async function UsersPage() {
  const [pendingUsers, approvedUsers] = await Promise.all([
    prisma.user.findMany({
      where: {
        OR: [
          { isApproved: false },
          { role: 'PENDING' }
        ]
      },
      orderBy: { createdAt: 'desc' },
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
          select: { provider: true }
        }
      }
    }),
    prisma.user.findMany({
      where: {
        isApproved: true,
        role: { not: 'PENDING' }
      },
      orderBy: { createdAt: 'desc' },
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
          select: { provider: true }
        }
      }
    })
  ])

  const stats = {
    pending: pendingUsers.length,
    approved: approvedUsers.length,
    google: pendingUsers.filter(u => u.accounts.some(a => a.provider === 'google')).length,
    web: pendingUsers.filter(u => u.accounts.length === 0).length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manajemen Pengguna</h1>
        <p className="text-muted-foreground">
          Kelola pengguna dan persetujuan akun baru
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menunggu</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disetujui</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
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
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.web}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Menunggu Persetujuan ({stats.pending})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Semua Pengguna ({stats.approved})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pendaftaran Menunggu Persetujuan</CardTitle>
              <CardDescription>
                User yang menunggu persetujuan dan assignment role/lembaga
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserApprovalTable users={pendingUsers} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Pengguna Aktif</CardTitle>
              <CardDescription>
                Semua pengguna yang sudah disetujui dan aktif
              </CardDescription>
            </CardHeader>
            <CardContent>
              {approvedUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Belum ada pengguna yang disetujui</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Metode</TableHead>
                      <TableHead>Tanggal Daftar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvedUsers.map((user) => {
                      const isGoogleUser = user.accounts.some(a => a.provider === 'google')
                      
                      return (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email || '-'}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {user.username}
                          </TableCell>
                          <TableCell>
                            <Badge>{user.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={isGoogleUser ? "default" : "secondary"}>
                              {isGoogleUser ? 'Google' : 'Web'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(user.createdAt), 'dd MMM yyyy', { locale: localeId })}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

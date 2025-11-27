import { getPendingRegistrations, getRegistrationStats, getAllRegistrations, getUstadzProfilesForRegistration } from "@/actions/registration-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RegistrationTable } from "@/components/users/registration-table"
import { UserPlus, Clock, CheckCircle, XCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function RegistrationsPage() {
  const [allRegistrations, stats, ustadzList] = await Promise.all([
    getAllRegistrations(),
    getRegistrationStats(),
    getUstadzProfilesForRegistration()
  ])

  const pendingRegistrations = allRegistrations.filter(r => r.status === 'PENDING')
  const approvedRegistrations = allRegistrations.filter(r => r.status === 'APPROVED')
  const rejectedRegistrations = allRegistrations.filter(r => r.status === 'REJECTED')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pendaftaran Akun</h1>
        <p className="text-muted-foreground">
          Kelola permohonan pendaftaran akun baru
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendaftaran</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menunggu</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disetujui</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ditolak</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Menunggu ({stats.pending})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Disetujui ({stats.approved})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Ditolak ({stats.rejected})
          </TabsTrigger>
          <TabsTrigger value="all">
            Semua ({stats.total})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pendaftaran Menunggu Persetujuan</CardTitle>
            </CardHeader>
            <CardContent>
              <RegistrationTable 
                registrations={pendingRegistrations} 
                ustadzList={ustadzList}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle>Pendaftaran Disetujui</CardTitle>
            </CardHeader>
            <CardContent>
              <RegistrationTable 
                registrations={approvedRegistrations} 
                ustadzList={ustadzList}
                readOnly
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected">
          <Card>
            <CardHeader>
              <CardTitle>Pendaftaran Ditolak</CardTitle>
            </CardHeader>
            <CardContent>
              <RegistrationTable 
                registrations={rejectedRegistrations} 
                ustadzList={ustadzList}
                readOnly
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Semua Pendaftaran</CardTitle>
            </CardHeader>
            <CardContent>
              <RegistrationTable 
                registrations={allRegistrations} 
                ustadzList={ustadzList}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


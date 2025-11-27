import { getBookkeepings, getBookkeepingStats } from "@/actions/bookkeeping-management-actions"
import { getLembagas } from "@/actions/lembaga-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookkeepingTable } from "@/components/bookkeeping/bookkeeping-table"
import { AddBookkeepingDialog } from "@/components/bookkeeping/add-bookkeeping-dialog"
import { BookOpen, Building2, Calendar, CheckCircle } from "lucide-react"
import { canCreateBookkeeping } from "@/lib/bookkeeping-permissions"

export default async function BookkeepingManagementPage() {
  const [bookkeepings, stats, lembagas, canCreate] = await Promise.all([
    getBookkeepings(),
    getBookkeepingStats(),
    getLembagas(),
    canCreateBookkeeping()
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Pembukuan</h1>
          <p className="text-muted-foreground">
            Kelola pembukuan umum, lembaga, dan custom
          </p>
        </div>
        {canCreate && <AddBookkeepingDialog lembagas={lembagas} />}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pembukuan</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pembukuan Umum</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.umum || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Per Lembaga</CardTitle>
            <Building2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.lembaga || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custom</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats?.custom || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pembukuan</CardTitle>
        </CardHeader>
        <CardContent>
          <BookkeepingTable bookkeepings={bookkeepings} />
        </CardContent>
      </Card>
    </div>
  )
}


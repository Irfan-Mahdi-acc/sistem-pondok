import { getAllMapelsGlobal } from "@/actions/mapel-actions"
import { getLembagas } from "@/actions/lembaga-actions"
import { getAllInstructors } from "@/actions/instructor-actions"
import { getMapelGroups } from "@/actions/mapel-group-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Building2, Users, FolderTree } from "lucide-react"
import { AddGlobalMapelDialog } from "@/components/mapel/add-global-mapel-dialog"
import GlobalMapelTable from "@/components/mapel/global-mapel-table"
import Link from "next/link"

export default async function AcademicMapelPage() {
  const [mapels, lembagas, instructors, groupsData] = await Promise.all([
    getAllMapelsGlobal(),
    getLembagas(),
    getAllInstructors(),
    getMapelGroups()
  ])

  const stats = {
    total: mapels.length,
    byInstitution: lembagas.map(l => ({
      name: l.name,
      count: mapels.filter(m => m.kelas.lembagaId === l.id).length
    })),
    withInstructor: mapels.filter(m => m.ustadzId).length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mata Pelajaran</h1>
          <p className="text-muted-foreground">
            Kelola mata pelajaran untuk semua lembaga
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/academic/mapel/groups">
            <Button variant="outline">
              <FolderTree className="h-4 w-4 mr-2" />
              Kelola Group
            </Button>
          </Link>
          <AddGlobalMapelDialog lembagas={lembagas} instructors={instructors} groupList={groupsData.groups} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mata Pelajaran</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lembaga Terdaftar</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lembagas.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dengan Pengampu</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withInstructor}</div>
          </CardContent>
        </Card>
      </div>

      <GlobalMapelTable 
        mapels={mapels} 
        lembagas={lembagas}
        instructors={instructors}
        groupList={groupsData.groups}
      />
    </div>
  )
}

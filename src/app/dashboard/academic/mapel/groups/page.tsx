import { getMapelGroups } from "@/actions/mapel-group-actions"
import { getLembagas } from "@/actions/lembaga-actions"
import { MapelGroupManagement } from "@/components/mapel/mapel-group-management"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default async function MapelGroupsPage() {
  const [groupsData, lembagas] = await Promise.all([
    getMapelGroups(),
    getLembagas()
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/academic/mapel">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Kelola Group Mata Pelajaran</h1>
          <p className="text-muted-foreground">Organisir mata pelajaran berdasarkan lembaga</p>
        </div>
      </div>

      <MapelGroupManagement
        groups={groupsData.groups}
        grouped={groupsData.grouped}
        lembagas={lembagas}
      />
    </div>
  )
}

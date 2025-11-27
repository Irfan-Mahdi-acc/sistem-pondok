import { getLembagas } from "@/actions/lembaga-actions"
import LembagaTable from "@/components/lembaga/lembaga-table"
import { AddLembagaDialog } from "@/components/lembaga/add-lembaga-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LembagaFilterWrapper } from "@/components/lembaga/lembaga-filter-wrapper"

export default async function LembagaPage() {
  const lembagas = await getLembagas()

  // Extract all unique tags
  const allTags = new Set<string>()
  lembagas.forEach(lembaga => {
    if (lembaga.tags) {
      lembaga.tags.split(',').forEach(tag => {
        const trimmed = tag.trim()
        if (trimmed) allTags.add(trimmed)
      })
    }
  })

  const stats = {
    total: lembagas.length,
    withTags: lembagas.filter(l => l.tags && l.tags.trim() !== '').length,
    uniqueTags: allTags.size,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Lembaga</h1>
          <p className="text-muted-foreground">
            Kelola lembaga dan organisasi pondok
          </p>
        </div>
        <AddLembagaDialog />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lembaga</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dengan Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.withTags}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueTags}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Table */}
      <LembagaFilterWrapper 
        lembagas={lembagas} 
        availableTags={Array.from(allTags).sort()} 
      />
    </div>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Award, TrendingUp } from "lucide-react"

interface UjianHifdzStatsProps {
  stats: {
    total: number
    distribution: Record<string, number>
  }
}

export function UjianHifdzStats({ stats }: UjianHifdzStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Ujian</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            Total ujian hafalan yang tercatat
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Predikat Mumtaz</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.distribution['A'] || 0}</div>
          <p className="text-xs text-muted-foreground">
            Santri dengan nilai A (Mumtaz)
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Kelulusan</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.total > 0 
              ? Math.round(((stats.distribution['A'] || 0) + (stats.distribution['B'] || 0)) / stats.total * 100) 
              : 0}%
          </div>
          <p className="text-xs text-muted-foreground">
            Persentase nilai A & B
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

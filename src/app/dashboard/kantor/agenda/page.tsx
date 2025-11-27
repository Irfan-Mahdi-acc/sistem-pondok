import { getAgendas, getAgendaStats } from "@/actions/agenda-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AddAgendaDialog } from "@/components/agenda/add-agenda-dialog"
import { AgendaTable } from "@/components/agenda/agenda-table"
import { Calendar, Clock, CheckCircle, Play } from "lucide-react"

export default async function AgendaPage() {
  const [agendas, stats] = await Promise.all([
    getAgendas(),
    getAgendaStats()
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agenda Kantor</h1>
          <p className="text-muted-foreground">
            Kelola agenda dan jadwal kegiatan kantor
          </p>
        </div>
        <AddAgendaDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agenda</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Direncanakan</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.planned}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Berlangsung</CardTitle>
            <Play className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.ongoing}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selesai</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Agenda</CardTitle>
        </CardHeader>
        <CardContent>
          <AgendaTable agendas={agendas} />
        </CardContent>
      </Card>
    </div>
  )
}

import { getAcademicCalendars } from "@/actions/academic-actions"
import { getAcademicYears } from "@/actions/academic-year-actions"
import { getLembagas } from "@/actions/lembaga-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AddCalendarEventDialog } from "@/components/academic/add-calendar-event-dialog"
import { AddAcademicYearDialog } from "@/components/academic/add-academic-year-dialog"
import { CalendarEventsList } from "@/components/academic/calendar-events-list"
import AcademicYearsList from "@/components/academic/academic-years-list"
import { CalendarView } from "@/components/academic/calendar-view"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function AcademicCalendarPage() {
  const [events, academicYears, lembagaList] = await Promise.all([
    getAcademicCalendars(),
    getAcademicYears(),
    getLembagas()
  ])

  const activeYear = academicYears.find(y => y.isActive)

  const stats = {
    total: events.length,
    holidays: events.filter(e => e.type === 'HOLIDAY').length,
    exams: events.filter(e => e.type === 'EXAM').length,
    events: events.filter(e => e.type === 'EVENT').length,
    academicYears: academicYears.length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kalender Akademik</h1>
          <p className="text-muted-foreground">
            Kelola tahun akademik dan event kalender
          </p>
        </div>
      </div>

      {/* Active Academic Year Banner */}
      {activeYear && (
        <Card className="border-primary bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Tahun Akademik Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold">{activeYear.name}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(activeYear.startDate).toLocaleDateString('id-ID')} - {new Date(activeYear.endDate).toLocaleDateString('id-ID')}
              </p>
              {activeYear.lembaga && (
                <p className="text-sm">Lembaga: {activeYear.lembaga.name}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Event</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Libur</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.holidays}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ujian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.exams}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kegiatan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.events}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tahun Akademik</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.academicYears}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Calendar Events and Academic Years */}
      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">Kalender & Event</TabsTrigger>
          <TabsTrigger value="view">Tampilan Kalender</TabsTrigger>
          <TabsTrigger value="academic-years">Tahun Akademik</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <div className="flex justify-end">
            <AddCalendarEventDialog lembagaList={lembagaList} academicYears={academicYears} />
          </div>
          <CalendarEventsList events={events} lembagaList={lembagaList} academicYears={academicYears} />
        </TabsContent>

        <TabsContent value="view" className="space-y-4">
          <CalendarView 
            events={events
              .filter(e => e.academicYear !== null)
              .map(e => ({
                id: e.id,
                title: e.title,
                type: e.type,
                startDate: new Date(e.startDate),
                endDate: new Date(e.endDate),
                academicYear: e.academicYear!,
                color: e.color || undefined
              }))} 
            academicYears={academicYears.map(y => ({
              id: y.id,
              name: y.name,
              startDate: new Date(y.startDate),
              endDate: new Date(y.endDate),
              isActive: y.isActive
            }))}
          />
        </TabsContent>

        <TabsContent value="academic-years" className="space-y-4">
          <div className="flex justify-end">
            <AddAcademicYearDialog lembagaList={lembagaList} />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Semua Tahun Akademik</CardTitle>
            </CardHeader>
            <CardContent>
              <AcademicYearsList academicYears={academicYears} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

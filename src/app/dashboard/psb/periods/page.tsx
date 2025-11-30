import { getPSBPeriods } from "@/actions/psb-actions"
import { PeriodDialog } from "@/components/psb/period-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"

export default async function PeriodsPage() {
  const periods = await getPSBPeriods()

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Daftar Gelombang</h3>
        <PeriodDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {periods.map((period) => (
          <Card key={period.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {period.name}
              </CardTitle>
              <Badge variant={period.isActive ? "default" : "secondary"}>
                {period.isActive ? "Aktif" : "Non-aktif"}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">
                {period._count.registrations} Pendaftar
              </div>
              <p className="text-xs text-muted-foreground">
                {format(new Date(period.startDate), "d MMM yyyy", { locale: id })} - {format(new Date(period.endDate), "d MMM yyyy", { locale: id })}
              </p>
              <div className="mt-4 flex justify-end">
                <PeriodDialog period={period} trigger={<button className="text-sm text-blue-500 hover:underline">Edit</button>} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

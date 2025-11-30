import { getPSBPeriods } from "@/actions/psb-actions"
import { prisma } from "@/lib/prisma"
import { PeriodDialog } from "@/components/psb/period-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function PeriodsPage() {
  const periods = await getPSBPeriods()
  const lembagas = await prisma.lembaga.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Daftar Gelombang</h3>
        <PeriodDialog lembagas={lembagas} trigger={
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Gelombang
            </Button>
          </DialogTrigger>
        } />
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
              <div className="text-xs text-muted-foreground mb-2">
                {period.lembaga?.name}
              </div>
              <div className="text-2xl font-bold mb-2">
                {period._count.registrations} Pendaftar
              </div>
              <p className="text-xs text-muted-foreground">
                {format(new Date(period.startDate), "d MMM yyyy", { locale: id })} - {format(new Date(period.endDate), "d MMM yyyy", { locale: id })}
              </p>
              <div className="mt-2 space-y-1">
                <p className="text-xs">
                  <span className="font-medium">Biaya Pendaftaran:</span> Rp {period.registrationFee?.toLocaleString('id-ID') || 0}
                </p>
                <p className="text-xs">
                  <span className="font-medium">Biaya Daftar Ulang:</span> Rp {period.reregistrationFee?.toLocaleString('id-ID') || 0}
                </p>
              </div>
              <div className="mt-4 flex justify-end">
                <PeriodDialog 
                  period={period} 
                  lembagas={lembagas}
                  trigger={
                    <DialogTrigger asChild>
                      <button className="text-sm text-blue-500 hover:underline">Edit</button>
                    </DialogTrigger>
                  } 
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

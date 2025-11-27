import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"

export default function AgendaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Agenda Kantor</h1>
        <p className="text-muted-foreground">
          Kelola agenda dan jadwal kegiatan kantor
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Agenda Kantor
          </CardTitle>
          <CardDescription>
            Fitur agenda kantor akan segera tersedia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Halaman ini akan menampilkan agenda kegiatan kantor, rapat, 
            dan jadwal penting lainnya.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

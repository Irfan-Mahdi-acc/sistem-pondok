import { getLembagas } from "@/actions/lembaga-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { FileText } from "lucide-react"

export default async function RaporPage() {
  const lembagaList = await getLembagas()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Rapor Ujian</h1>
          <p className="text-sm text-muted-foreground">
            Lihat dan kelola rapor nilai ujian santri
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pilih Lembaga</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Pilih lembaga untuk melihat rapor ujian santri
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {lembagaList.map((lembaga) => (
              <Link key={lembaga.id} href={`/dashboard/academic/rapor/${lembaga.id}`}>
                <Card className="hover:bg-accent cursor-pointer transition-colors">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{lembaga.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {lembaga.jenjang || 'Tidak ada jenjang'}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

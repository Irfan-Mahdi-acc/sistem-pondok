import { getRaporByLembaga, getKelasByLembaga } from "@/actions/rapor-actions"
import { getLembagaById } from "@/actions/lembaga-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RaporTable } from "@/components/rapor/rapor-table"
import { RaporFilters } from "@/components/rapor/rapor-filters"
import { ExportKelasButton } from "@/components/rapor/export-kelas-button"
import { FileText } from "lucide-react"

export default async function RaporLembagaPage({
  params,
  searchParams
}: {
  params: Promise<{ lembagaId: string }>
  searchParams: Promise<{ kelasId?: string }>
}) {
  const { lembagaId } = await params
  const { kelasId } = await searchParams

  const [lembaga, kelasList, raporData] = await Promise.all([
    getLembagaById(lembagaId),
    getKelasByLembaga(lembagaId),
    getRaporByLembaga(lembagaId, kelasId)
  ])

  if (!lembaga) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Lembaga tidak ditemukan</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Rapor Ujian - {lembaga.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {lembaga.jenjang || 'Tidak ada jenjang'}
          </p>
        </div>
        {raporData.length > 0 && (
          <ExportKelasButton 
            data={raporData}
            kelasName={kelasId ? kelasList.find(k => k.id === kelasId)?.name || 'Kelas' : 'Semua Kelas'}
          />
        )}
      </div>

      <RaporFilters 
        lembagaId={lembagaId}
        kelasList={kelasList}
        selectedKelasId={kelasId}
      />

      <Card>
        <CardHeader>
          <CardTitle>
            {kelasId 
              ? `Rapor Kelas ${kelasList.find(k => k.id === kelasId)?.name}` 
              : 'Rapor Semua Kelas'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {raporData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Belum ada data rapor</p>
              <p className="text-sm text-muted-foreground mt-2">
                Pastikan sudah ada data nilai ujian untuk santri
              </p>
            </div>
          ) : (
            <RaporTable data={raporData} lembagaId={lembagaId} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

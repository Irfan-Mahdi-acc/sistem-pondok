import { getKelasList } from "@/actions/kelas-actions"
import { getLembagas } from "@/actions/lembaga-actions"
import KelasTable from "@/components/kelas/kelas-table"
import { AddKelasDialog } from "@/components/kelas/add-kelas-dialog"

export default async function LembagaKelasPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [allKelas, lembagas] = await Promise.all([
    getKelasList(),
    getLembagas()
  ])

  const kelasList = allKelas.filter(k => k.lembagaId === id)
  const currentLembaga = lembagas.find(l => l.id === id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Manajemen Kelas</h2>
        <AddKelasDialog 
          lembagas={[currentLembaga!]} 
          kelasList={allKelas}
          defaultLembagaId={id}
        />
      </div>
      <KelasTable kelasList={kelasList} allKelas={allKelas} lembagas={lembagas} lembagaId={id} />
    </div>
  )
}

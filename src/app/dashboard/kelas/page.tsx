import { getKelasList } from "@/actions/kelas-actions"
import { getLembagas } from "@/actions/lembaga-actions"
import KelasTable from "@/components/kelas/kelas-table"
import { AddKelasDialog } from "@/components/kelas/add-kelas-dialog"

export default async function KelasPage() {
  const [kelasList, lembagas] = await Promise.all([
    getKelasList(),
    getLembagas()
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Class Management (Kelas)</h1>
        <AddKelasDialog lembagas={lembagas} kelasList={kelasList} />
      </div>
      <KelasTable kelasList={kelasList} allKelas={kelasList} lembagas={lembagas} lembagaId="" />
    </div>
  )
}

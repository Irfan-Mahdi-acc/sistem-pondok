import { getMapelsByLembaga } from "@/actions/mapel-actions"
import { getKelasList } from "@/actions/kelas-actions"
import { getAllInstructors } from "@/actions/instructor-actions"
import MapelTable from "@/components/mapel/mapel-table"
import { AddMapelDialog } from "@/components/mapel/add-mapel-dialog"

export default async function LembagaMapelPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [mapels, allKelas, instructorList] = await Promise.all([
    getMapelsByLembaga(id),
    getKelasList(),
    getAllInstructors()
  ])

  // Filter kelas for this lembaga
  const kelasList = allKelas.filter(k => k.lembagaId === id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Manajemen Mata Pelajaran</h2>
        <AddMapelDialog kelasList={kelasList} instructorList={instructorList} />
      </div>
      <MapelTable mapels={mapels} kelasList={kelasList} instructorList={instructorList} />
    </div>
  )
}

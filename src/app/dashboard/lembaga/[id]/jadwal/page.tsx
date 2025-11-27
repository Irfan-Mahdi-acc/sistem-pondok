import { getJamPelajaranByLembaga, getJadwalByLembaga } from "@/actions/jadwal-actions"
import { getKelasList } from "@/actions/kelas-actions"
import { getMapelsByLembaga } from "@/actions/mapel-actions"
import JamPelajaranSection from "@/components/jadwal/jam-pelajaran-section"
import JadwalSection from "@/components/jadwal/jadwal-section"

export default async function LembagaJadwalPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [jamPelajaran, jadwals, allKelas, mapels] = await Promise.all([
    getJamPelajaranByLembaga(id),
    getJadwalByLembaga(id),
    getKelasList(),
    getMapelsByLembaga(id)
  ])

  const kelasList = allKelas.filter(k => k.lembagaId === id)

  return (
    <div className="space-y-8">
      <JamPelajaranSection jamPelajaran={jamPelajaran} lembagaId={id} />
      <JadwalSection 
        jadwals={jadwals} 
        kelasList={kelasList} 
        mapels={mapels}
        jamPelajaran={jamPelajaran}
      />
    </div>
  )
}

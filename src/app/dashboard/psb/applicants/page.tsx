import { getPSBRegistrations } from "@/actions/psb-actions"
import { prisma } from "@/lib/prisma"
import { ApplicantTable } from "@/components/psb/applicant-table"

export default async function ApplicantsPage() {
  const registrations = await getPSBRegistrations()
  const lembagas = await prisma.lembaga.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  })
  const allKelas = await prisma.kelas.findMany({
    select: { id: true, name: true, lembagaId: true },
    orderBy: { name: 'asc' }
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Data Pendaftar</h3>
      </div>
      <ApplicantTable 
        registrations={registrations} 
        lembagas={lembagas}
        allKelas={allKelas}
      />
    </div>
  )
}

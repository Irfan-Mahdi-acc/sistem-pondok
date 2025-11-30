import { getPSBRegistrations } from "@/actions/psb-actions"
import { ApplicantTable } from "@/components/psb/applicant-table"

export default async function ApplicantsPage() {
  const registrations = await getPSBRegistrations()

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Data Pendaftar</h3>
      </div>
      <ApplicantTable registrations={registrations} />
    </div>
  )
}

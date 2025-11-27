import { getGradeSettings } from "@/actions/grade-setting-actions"
import { GradeSettingsManagement } from "@/components/settings/grade-settings-management"
import { redirect } from "next/navigation"

// TODO: Get lembagaId from user session
const TEMP_LEMBAGA_ID = "cm3xtxbvl0000hzwrqkm7bnwz" // Replace with actual session logic

export default async function GradeSettingsPage() {
  const result = await getGradeSettings(TEMP_LEMBAGA_ID)

  if (!result.success) {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pengaturan Nilai</h1>
        <p className="text-muted-foreground mt-2">
          Kelola label dan keterangan untuk nilai ujian hifdz (1-10)
        </p>
      </div>

      <GradeSettingsManagement 
        lembagaId={TEMP_LEMBAGA_ID}
        settings={result.data || []}
      />
    </div>
  )
}

import { getActivePSBPeriod } from "@/actions/psb-actions"
import { RegistrationForm } from "@/components/psb/registration-form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"

export default async function RegisterPage() {
  const activePeriod = await getActivePSBPeriod()

  if (!activePeriod) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Pendaftaran Ditutup</h1>
        <p className="text-muted-foreground">Saat ini tidak ada gelombang pendaftaran yang aktif.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">Formulir Pendaftaran</h1>
        <p className="text-center text-muted-foreground mb-6">
          Gelombang: {activePeriod.name}
        </p>
        
        <Alert className="mb-6 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-800 dark:text-blue-300">Informasi Penting</AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-400">
            Pastikan data yang Anda masukkan sesuai dengan dokumen resmi (Akta Kelahiran/KK).
            Biaya pendaftaran sebesar {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(activePeriod.registrationFee)}.
          </AlertDescription>
        </Alert>
      </div>

      <RegistrationForm periodId={activePeriod.id} />
    </div>
  )
}

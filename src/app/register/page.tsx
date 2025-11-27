import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RegistrationForm } from "@/components/auth/registration-form"
import { Info } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function RegisterPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-2xl space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-primary">Pendaftaran Akun</h1>
          <p className="text-sm text-muted-foreground">Sistem Pondok Tadzimussunnah</p>
        </div>

        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
          <CardContent className="pt-4">
            <div className="flex gap-2 text-xs text-muted-foreground">
              <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium mb-1">Persetujuan Admin Diperlukan</p>
                <p>Pendaftaran Anda akan ditinjau oleh admin. Anda akan diberitahu setelah akun disetujui.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <RegistrationForm />

        <div className="text-center">
          <Link href="/login">
            <Button variant="link" size="sm">
              Sudah punya akun? Masuk di sini
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}


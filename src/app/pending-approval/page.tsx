import { auth, signOut } from "@/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Mail, LogOut } from "lucide-react"
import { redirect } from "next/navigation"

export default async function PendingApprovalPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }

  // @ts-ignore
  if (session.user.isApproved === true && session.user.role !== 'PENDING') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
            <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <CardTitle className="text-2xl">Menunggu Persetujuan</CardTitle>
          <CardDescription>
            Akun Anda sedang dalam proses verifikasi
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <p className="text-sm font-medium">Informasi Akun:</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p><strong>Nama:</strong> {session.user.name}</p>
                <p><strong>Email:</strong> {session.user.email || '-'}</p>
                <p><strong>Username:</strong> {session.user.id}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Apa yang terjadi?</p>
                  <p className="text-sm text-muted-foreground">
                    Akun Anda telah berhasil dibuat dan sedang menunggu persetujuan dari administrator.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Berapa lama prosesnya?</p>
                  <p className="text-sm text-muted-foreground">
                    Biasanya proses verifikasi memakan waktu 1-2 hari kerja. Anda akan menerima notifikasi via email setelah akun disetujui.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950 p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Catatan:</strong> Administrator akan meninjau pendaftaran Anda dan menetapkan role serta lembaga yang sesuai.
              </p>
            </div>
          </div>

          <form action={async () => {
            'use server'
            await signOut({ redirectTo: '/login' })
          }}>
            <Button type="submit" variant="outline" className="w-full">
              <LogOut className="mr-2 h-4 w-4" />
              Keluar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

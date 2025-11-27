import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function BookkeepingPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pembukuan</h1>
        <p className="text-muted-foreground">
          Kelola catatan pembukuan keuangan
        </p>
      </div>

      <div className="rounded-lg border p-8 text-center">
        <p className="text-muted-foreground">
          Fitur pembukuan akan segera tersedia.
        </p>
      </div>
    </div>
  )
}

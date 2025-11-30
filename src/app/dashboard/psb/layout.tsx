import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "PSB Management",
  description: "Penerimaan Santri Baru Management",
}

export default function PSBLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Penerimaan Santri Baru</h2>
      </div>
      <div className="flex space-x-2 border-b pb-2">
        <Link href="/dashboard/psb">
          <Button variant="ghost">Overview</Button>
        </Link>
        <Link href="/dashboard/psb/periods">
          <Button variant="ghost">Gelombang</Button>
        </Link>
        <Link href="/dashboard/psb/applicants">
          <Button variant="ghost">Pendaftar</Button>
        </Link>
      </div>
      {children}
    </div>
  )
}

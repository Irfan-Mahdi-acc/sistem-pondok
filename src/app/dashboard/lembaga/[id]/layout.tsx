import { getLembagas } from "@/actions/lembaga-actions"
import { notFound } from "next/navigation"
import Link from "next/link"
import { LembagaTabs } from "@/components/lembaga/lembaga-tabs"

export default async function LembagaDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const lembagas = await getLembagas()
  const lembaga = lembagas.find((l) => l.id === id)

  if (!lembaga) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {lembaga.logoUrl && (
              <img src={lembaga.logoUrl} alt="logo" className="h-8 w-8 rounded-full object-cover" />
            )}
            {lembaga.name}
          </h1>
          {lembaga.jenjang && (
            <p className="text-sm text-muted-foreground">Jenjang: {lembaga.jenjang}</p>
          )}
        </div>
        <Link href="/dashboard/lembaga">
          <button className="text-sm text-blue-600 hover:underline">← Back to Lembaga List</button>
        </Link>
      </div>

      <LembagaTabs lembagaId={id} />

      <div>{children}</div>
    </div>
  )
}


'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"

export function LembagaTabs({ lembagaId }: { lembagaId: string }) {
  const pathname = usePathname()

  const tabs = [
    { href: `/dashboard/lembaga/${lembagaId}`, label: 'Ringkasan', exact: true },
    { href: `/dashboard/lembaga/${lembagaId}/kelas`, label: 'Kelas' },
    { href: `/dashboard/lembaga/${lembagaId}/mapel`, label: 'Mata Pelajaran' },
    { href: `/dashboard/lembaga/${lembagaId}/jadwal`, label: 'Jadwal' },
    { href: `/dashboard/lembaga/${lembagaId}/grades`, label: 'Nilai' },
  ]

  return (
    <div className="border-b">
      <nav className="flex gap-4">
        {tabs.map((tab) => {
          const isActive = tab.exact 
            ? pathname === tab.href 
            : pathname.startsWith(tab.href)

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent hover:border-gray-300 text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

'use client'

import { useRouter, useSearchParams } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface UjianHifdzFilterProps {
  lembagas: any[]
  halqohs: any[]
}

export function UjianHifdzFilter({ lembagas, halqohs }: UjianHifdzFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentLembaga = searchParams.get('lembagaId') || 'all'
  const currentHalqoh = searchParams.get('halqohId') || 'all'

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('?')
  }

  const hasFilters = currentLembaga !== 'all' || currentHalqoh !== 'all'

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center mb-6">
      <div className="w-full sm:w-[200px]">
        <Select
          value={currentLembaga}
          onValueChange={(val) => updateFilter('lembagaId', val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter Lembaga" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Lembaga</SelectItem>
            {lembagas.map((l) => (
              <SelectItem key={l.id} value={l.id}>
                {l.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full sm:w-[200px]">
        <Select
          value={currentHalqoh}
          onValueChange={(val) => updateFilter('halqohId', val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter Halqoh" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Halqoh</SelectItem>
            {halqohs.map((h) => (
              <SelectItem key={h.id} value={h.id}>
                {h.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <Button variant="ghost" onClick={clearFilters} size="icon" title="Hapus Filter">
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

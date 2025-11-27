'use client'

import { useState, useCallback } from 'react'
import SantriTable from "./santri-table"
import { SantriFilters } from "./santri-filters"
import { SantriExportButtons } from "./santri-export-buttons"
import { getFilteredSantri } from "@/actions/santri-filter-actions"

type SantriListWrapperProps = {
  initialSantri: any[]
  lembagas: any[]
  kelasList: any[]
}

export function SantriListWrapper({ initialSantri, lembagas, kelasList }: SantriListWrapperProps) {
  const [santriData, setSantriData] = useState(initialSantri)
  const [loading, setLoading] = useState(false)

  const handleFilterChange = useCallback(async (filters: {
    search: string
    lembagaId: string
    kelasId: string
    status: string
    gender: string
  }) => {
    setLoading(true)
    try {
      const filtered = await getFilteredSantri({
        search: filters.search || undefined,
        lembagaId: filters.lembagaId || undefined,
        kelasId: filters.kelasId || undefined,
        status: filters.status || undefined,
        gender: filters.gender || undefined,
      })
      setSantriData(filtered)
    } catch (error) {
      console.error('Error filtering santri:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div className="space-y-4">
      {/* Filter and Export in one row */}
      <div className="flex items-center justify-between">
        <SantriFilters
          onFilterChange={handleFilterChange}
          lembagaList={lembagas}
          kelasList={kelasList}
        />
        <SantriExportButtons santriData={santriData} disabled={loading} />
      </div>

      <SantriTable santriList={santriData} />
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Filter, X, Search } from "lucide-react"

type FilterProps = {
  onFilterChange: (filters: {
    search: string
    lembagaId: string
    kelasId: string
    status: string
    gender: string
  }) => void
  lembagaList: Array<{ id: string; nama: string }>
  kelasList: Array<{ id: string; nama: string; lembagaId: string }>
}

export function SantriFilters({ onFilterChange, lembagaList, kelasList }: FilterProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [search, setSearch] = useState('')
  const [lembagaId, setLembagaId] = useState('')
  const [kelasId, setKelasId] = useState('')
  const [status, setStatus] = useState('')
  const [gender, setGender] = useState('')

  // Filter kelas based on selected lembaga
  const filteredKelas = lembagaId
    ? kelasList.filter(k => k.lembagaId === lembagaId)
    : kelasList

  // Trigger filter change with debounce for search
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ search, lembagaId, kelasId, status, gender })
    }, 300)
    return () => clearTimeout(timer)
  }, [search, lembagaId, kelasId, status, gender, onFilterChange])

  // Reset kelas when lembaga changes
  useEffect(() => {
    if (lembagaId && kelasId) {
      const kelasExists = filteredKelas.some(k => k.id === kelasId)
      if (!kelasExists) {
        setKelasId('')
      }
    }
  }, [lembagaId, kelasId, filteredKelas])

  const handleReset = () => {
    setSearch('')
    setLembagaId('')
    setKelasId('')
    setStatus('')
    setGender('')
  }

  const hasActiveFilters = lembagaId !== '' || kelasId !== '' || status !== '' || gender !== ''

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama, NIS, NISN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Button */}
        <Button
          variant={showFilters ? "default" : "outline"}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filter
          {hasActiveFilters && (
            <span className="ml-2 bg-primary-foreground text-primary rounded-full px-2 py-0.5 text-xs">
              {[lembagaId, kelasId, status, gender].filter(f => f !== '').length}
            </span>
          )}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <X className="h-4 w-4 mr-1" />
            Reset
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="rounded-lg border p-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Lembaga */}
            <div className="space-y-2">
              <Label>Lembaga</Label>
              <Select value={lembagaId} onValueChange={setLembagaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua" />
                </SelectTrigger>
                <SelectContent>
                  {lembagaList.map((lembaga) => (
                    <SelectItem key={lembaga.id} value={lembaga.id}>
                      {lembaga.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Kelas */}
            <div className="space-y-2">
              <Label>Kelas</Label>
              <Select value={kelasId} onValueChange={setKelasId} disabled={!lembagaId && kelasList.length > 20}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua" />
                </SelectTrigger>
                <SelectContent>
                  {filteredKelas.map((kelas) => (
                    <SelectItem key={kelas.id} value={kelas.id}>
                      {kelas.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Aktif</SelectItem>
                  <SelectItem value="GRADUATED">Lulus</SelectItem>
                  <SelectItem value="DROPPED">Keluar</SelectItem>
                  <SelectItem value="TRANSFERRED">Pindah</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label>Jenis Kelamin</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">Laki-laki</SelectItem>
                  <SelectItem value="P">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

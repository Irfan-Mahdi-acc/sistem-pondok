'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { UserPlus, Trash2 } from "lucide-react"
import { addSantriToHalqoh, removeSantriFromHalqoh } from "@/actions/halqoh-actions"
import { useRouter } from 'next/navigation'

interface HalqohSantriListProps {
  halqohId: string
  enrolledSantri: any[]
  availableSantri: any[]
  maxCapacity: number | null
}

export function HalqohSantriList({ halqohId, enrolledSantri, availableSantri, maxCapacity }: HalqohSantriListProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [selectedSantri, setSelectedSantri] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)

  const isFull = maxCapacity ? enrolledSantri.length >= maxCapacity : false

  // Filter santri based on search query
  const filteredSantri = availableSantri.filter((santri) => {
    const query = searchQuery.toLowerCase()
    return (
      santri.nama.toLowerCase().includes(query) ||
      santri.nis.toLowerCase().includes(query) ||
      santri.lembaga.nama.toLowerCase().includes(query)
    )
  })

  async function handleAddSantri() {
    if (!selectedSantri) return

    setLoading(true)
    const result = await addSantriToHalqoh(halqohId, selectedSantri)
    
    if (result.success) {
      setOpen(false)
      setSelectedSantri('')
      setSearchQuery('')
      setShowDropdown(false)
      router.refresh()
    } else {
      alert(result.error || 'Gagal menambahkan santri')
    }
    setLoading(false)
  }

  async function handleRemoveSantri(santriId: string) {
    if (!confirm('Yakin ingin mengeluarkan santri dari halqoh ini?')) return

    const result = await removeSantriFromHalqoh(halqohId, santriId)
    
    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || 'Gagal mengeluarkan santri')
    }
  }

  function handleSelectSantri(santri: any) {
    setSelectedSantri(santri.id)
    setSearchQuery(santri.nama)
    setShowDropdown(false)
  }

  function handleSearchChange(value: string) {
    setSearchQuery(value)
    setShowDropdown(value.length > 0)
    if (value.length === 0) {
      setSelectedSantri('')
    }
  }

  return (
    <div className="space-y-4">
      {/* Add Santri Button */}
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button disabled={isFull || availableSantri.length === 0}>
              <UserPlus className="h-4 w-4 mr-2" />
              Tambah Santri
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Santri ke Halqoh</DialogTitle>
              <DialogDescription>
                Pilih santri yang akan ditambahkan ke halqoh ini
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Cari Santri</Label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ketik nama atau NIS santri..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => searchQuery && setShowDropdown(true)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  {showDropdown && searchQuery && (
                    <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
                      {filteredSantri.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          Tidak ada santri ditemukan
                        </div>
                      ) : (
                        filteredSantri.map((santri) => (
                          <button
                            key={santri.id}
                            type="button"
                            onClick={() => handleSelectSantri(santri)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                          >
                            <div className="font-medium">{santri.nama}</div>
                            <div className="text-xs text-muted-foreground">
                              {santri.nis} • {santri.lembaga.nama} {santri.kelas?.nama || ''}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setOpen(false)
                  setSearchQuery('')
                  setSelectedSantri('')
                  setShowDropdown(false)
                }}>
                  Batal
                </Button>
                <Button onClick={handleAddSantri} disabled={!selectedSantri || loading}>
                  {loading ? 'Menambahkan...' : 'Tambahkan'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Santri Table */}
      {enrolledSantri.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Belum ada santri terdaftar di halqoh ini
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NIS</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Lembaga</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrolledSantri.map((santri) => (
                <TableRow key={santri.id}>
                  <TableCell>{santri.nis}</TableCell>
                  <TableCell className="font-medium">{santri.nama}</TableCell>
                  <TableCell>{santri.lembaga.nama}</TableCell>
                  <TableCell>{santri.kelas?.nama || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveSantri(santri.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {isFull && (
        <p className="text-sm text-amber-600">
          ⚠️ Halqoh sudah mencapai kapasitas maksimal
        </p>
      )}
    </div>
  )
}

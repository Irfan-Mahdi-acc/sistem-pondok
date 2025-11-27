'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { updateKetuaAsrama } from "@/actions/asrama-actions"
import { UserCheck, X } from "lucide-react"

export function AssignKetuaAsramaDialog({ 
  asramaId, 
  currentKetuaId,
  santriList 
}: { 
  asramaId: string
  currentKetuaId: string | null
  santriList: any[]
}) {
  const [open, setOpen] = useState(false)
  const [selectedSantri, setSelectedSantri] = useState<string>('')

  async function handleAssign() {
    const res = await updateKetuaAsrama(asramaId, selectedSantri || null)
    if (res.success) {
      setOpen(false)
      setSelectedSantri('')
    } else {
      alert('Gagal mengatur ketua asrama')
    }
  }

  async function handleRemove() {
    if (confirm('Yakin ingin menghapus ketua asrama?')) {
      const res = await updateKetuaAsrama(asramaId, null)
      if (res.success) {
        setOpen(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserCheck className="h-4 w-4 mr-1" />
          {currentKetuaId ? 'Ubah' : 'Tetapkan'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tetapkan Ketua Asrama</DialogTitle>
          <DialogDescription>
            Pilih santri dari asrama ini sebagai ketua asrama
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label>Pilih Santri</Label>
            <Select value={selectedSantri} onValueChange={setSelectedSantri}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih santri" />
              </SelectTrigger>
              <SelectContent>
                {santriList.map((santri) => (
                  <SelectItem key={santri.id} value={santri.id}>
                    {santri.nama} - {santri.nis}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-between">
            {currentKetuaId && (
              <Button variant="destructive" onClick={handleRemove}>
                <X className="h-4 w-4 mr-1" />
                Hapus Ketua
              </Button>
            )}
            <Button onClick={handleAssign} className="ml-auto">
              Simpan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

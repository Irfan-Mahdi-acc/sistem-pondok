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
import { updateMusyrif } from "@/actions/asrama-actions"
import { GraduationCap, X } from "lucide-react"

export function AssignMusyrifDialog({ 
  asramaId, 
  currentMusyrifId,
  ustadzList 
}: { 
  asramaId: string
  currentMusyrifId: string | null
  ustadzList: Array<{ id: string; nik?: string | null; user: { name: string } | null }>
}) {
  const [open, setOpen] = useState(false)
  const [selectedUstadz, setSelectedUstadz] = useState<string>('')

  async function handleAssign() {
    const res = await updateMusyrif(asramaId, selectedUstadz || null)
    if (res.success) {
      setOpen(false)
      setSelectedUstadz('')
    } else {
      alert('Gagal mengatur musyrif')
    }
  }

  async function handleRemove() {
    if (confirm('Yakin ingin menghapus musyrif?')) {
      const res = await updateMusyrif(asramaId, null)
      if (res.success) {
        setOpen(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <GraduationCap className="h-4 w-4 mr-1" />
          {currentMusyrifId ? 'Ubah' : 'Tetapkan'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tetapkan Musyrif</DialogTitle>
          <DialogDescription>
            Pilih ustadz sebagai musyrif asrama
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label>Pilih Ustadz</Label>
            <Select value={selectedUstadz} onValueChange={setSelectedUstadz}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih ustadz" />
              </SelectTrigger>
              <SelectContent>
                {ustadzList
                  .filter(ustadz => ustadz.user !== null)
                  .map((ustadz) => (
                    <SelectItem key={ustadz.id} value={ustadz.id}>
                      {ustadz.user!.name} {ustadz.nik ? `- ${ustadz.nik}` : ''}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-between">
            {currentMusyrifId && (
              <Button variant="destructive" onClick={handleRemove}>
                <X className="h-4 w-4 mr-1" />
                Hapus Musyrif
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

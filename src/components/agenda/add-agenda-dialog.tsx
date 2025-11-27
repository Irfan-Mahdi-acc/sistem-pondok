'use client'

import { useState } from 'react'
import { createAgenda } from '@/actions/agenda-actions'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'

export function AddAgendaDialog() {
  const [open, setOpen] = useState(false)

  async function handleSubmit(formData: FormData) {
    const result = await createAgenda(formData)
    if (result.success) {
      setOpen(false)
    } else {
      alert(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Agenda
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tambah Agenda Baru</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Judul Agenda *</Label>
            <Input id="title" name="title" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Deskripsi agenda..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Jenis *</Label>
              <Select name="type" required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RAPAT">Rapat</SelectItem>
                  <SelectItem value="ACARA">Acara</SelectItem>
                  <SelectItem value="DEADLINE">Deadline</SelectItem>
                  <SelectItem value="LAINNYA">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Lokasi</Label>
              <Input id="location" name="location" placeholder="Ruang Rapat" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Tanggal *</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Jam Mulai</Label>
              <Input id="startTime" name="startTime" type="time" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Jam Selesai</Label>
              <Input id="endTime" name="endTime" type="time" />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit">Simpan</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}



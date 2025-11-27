'use client'

import { useState } from 'react'
import { updateKetuaKelas } from '@/actions/kelas-actions'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { UserCircle } from 'lucide-react'

interface AssignKetuaKelasDialogProps {
  kelasId: string
  currentKetuaId: string | null
  santriList: Array<{ id: string; nama: string }>
}

export function AssignKetuaKelasDialog({
  kelasId,
  currentKetuaId,
  santriList,
}: AssignKetuaKelasDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedSantriId, setSelectedSantriId] = useState<string>(currentKetuaId || '')

  async function handleSubmit() {
    await updateKetuaKelas(kelasId, selectedSantriId || null)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserCircle className="mr-2 h-4 w-4" />
          Atur
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atur Ketua Kelas</DialogTitle>
          <DialogDescription>
            Pilih santri yang akan menjadi ketua kelas
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="ketua">Ketua Kelas</Label>
            <Select value={selectedSantriId} onValueChange={setSelectedSantriId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih santri" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tidak ada</SelectItem>
                {santriList.map((santri) => (
                  <SelectItem key={santri.id} value={santri.id}>
                    {santri.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button onClick={handleSubmit}>Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

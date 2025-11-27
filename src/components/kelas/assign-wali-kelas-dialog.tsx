'use client'

import { useState } from 'react'
import { updateWaliKelas } from '@/actions/kelas-actions'
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

interface AssignWaliKelasDialogProps {
  kelasId: string
  currentWaliId: string | null
  ustadzList: Array<{ id: string; user: { name: string } }>
}

export function AssignWaliKelasDialog({
  kelasId,
  currentWaliId,
  ustadzList,
}: AssignWaliKelasDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedUstadzId, setSelectedUstadzId] = useState<string>(currentWaliId || '')

  async function handleSubmit() {
    await updateWaliKelas(kelasId, selectedUstadzId || null)
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
          <DialogTitle>Atur Wali Kelas</DialogTitle>
          <DialogDescription>
            Pilih ustadz yang akan menjadi wali kelas
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="wali">Wali Kelas</Label>
            <Select value={selectedUstadzId} onValueChange={setSelectedUstadzId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih ustadz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tidak ada</SelectItem>
                {ustadzList.map((ustadz) => (
                  <SelectItem key={ustadz.id} value={ustadz.id}>
                    {ustadz.user.name}
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

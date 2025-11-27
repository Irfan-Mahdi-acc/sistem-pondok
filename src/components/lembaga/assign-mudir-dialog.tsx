'use client'

import { useState } from 'react'
import { updateMudir } from '@/actions/lembaga-actions'
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

interface AssignMudirDialogProps {
  lembagaId: string
  currentMudirId: string | null
  ustadzList: Array<{ id: string; user: { name: string } | null }>
}

export function AssignMudirDialog({
  lembagaId,
  currentMudirId,
  ustadzList,
}: AssignMudirDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedUstadzId, setSelectedUstadzId] = useState<string>(currentMudirId || '')

  async function handleSubmit() {
    await updateMudir(lembagaId, selectedUstadzId || null)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserCircle className="mr-2 h-4 w-4" />
          Atur Mudir
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atur Mudir (Kepala Lembaga)</DialogTitle>
          <DialogDescription>
            Pilih ustadz yang akan menjadi Mudir (Kepala Lembaga)
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="mudir">Mudir</Label>
            <Select value={selectedUstadzId} onValueChange={setSelectedUstadzId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih ustadz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tidak ada</SelectItem>
                {ustadzList.map((ustadz) => (
                  <SelectItem key={ustadz.id} value={ustadz.id}>
                    {ustadz.user?.name || 'Unnamed'}
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



'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UserPlus } from 'lucide-react'

type UstadzProfile = {
  id: string
  user: { id: string; name: string } | null
}

export function AssignUstadzToMapelDialog({
  mapelId,
  mapelName,
  currentUstadzId,
  ustadzList,
  onAssign,
}: {
  mapelId: string
  mapelName: string
  currentUstadzId?: string | null
  ustadzList: UstadzProfile[]
  onAssign: (mapelId: string, ustadzId: string | null) => Promise<{ success: boolean; error?: string }>
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedUstadzId, setSelectedUstadzId] = useState<string>(currentUstadzId || '')

  async function handleAssign() {
    setLoading(true)
    const result = await onAssign(mapelId, selectedUstadzId || null)
    
    if (result.success) {
      setOpen(false)
    } else {
      alert(result.error || 'Gagal mengassign ustadz')
    }
    
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="mr-2 h-4 w-4" />
          {currentUstadzId ? 'Ubah Pengampu' : 'Assign Pengampu'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Pengampu Mapel</DialogTitle>
          <DialogDescription>
            Pilih ustadz untuk mengampu mata pelajaran ini
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Mata Pelajaran:</p>
            <p className="font-medium">{mapelName}</p>
          </div>

          <div className="space-y-2">
            <Label>Pilih Pengampu</Label>
            <Select value={selectedUstadzId} onValueChange={setSelectedUstadzId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih ustadz..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tidak ada pengampu</SelectItem>
                {ustadzList.map((ustadz) => (
                  <SelectItem key={ustadz.id} value={ustadz.id}>
                    {ustadz.user?.name || `Ustadz ID: ${ustadz.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Batal
            </Button>
            <Button onClick={handleAssign} disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


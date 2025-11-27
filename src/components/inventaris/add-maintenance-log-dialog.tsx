'use client'

import { addMaintenanceLog } from '@/actions/inventaris-actions'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type Asset = {
  id: string
  name: string
}

export function AddMaintenanceLogDialog({
  asset,
  open,
  onOpenChange,
}: {
  asset: Asset
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  async function handleSubmit(formData: FormData) {
    formData.append('assetId', asset.id)
    const result = await addMaintenanceLog(formData)
    if (result.success) {
      onOpenChange(false)
    } else {
      alert(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Pemeliharaan - {asset.name}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
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
            <Label htmlFor="description">Deskripsi *</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Deskripsi pekerjaan pemeliharaan..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost">Biaya</Label>
              <Input
                id="cost"
                name="cost"
                type="number"
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="performer">Pelaksana</Label>
              <Input
                id="performer"
                name="performer"
                placeholder="Nama teknisi/petugas"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit">Simpan</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}



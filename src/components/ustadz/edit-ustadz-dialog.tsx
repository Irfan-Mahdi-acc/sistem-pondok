'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateUstadz } from "@/actions/ustadz-actions"
import { useState } from "react"

interface EditUstadzDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ustadz: any
}

export function EditUstadzDialog({ open, onOpenChange, ustadz }: EditUstadzDialogProps) {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const res = await updateUstadz(ustadz.id, formData)
    if (res.success) {
      onOpenChange(false)
    } else {
      alert('Gagal memperbarui ustadz')
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Ustadz</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nama *
            </Label>
            <Input 
              id="name" 
              name="name" 
              className="col-span-3" 
              required 
              defaultValue={ustadz.user.name}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nik" className="text-right">
              NIK
            </Label>
            <Input 
              id="nik" 
              name="nik" 
              className="col-span-3" 
              defaultValue={ustadz.nik || ''}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Telepon
            </Label>
            <Input 
              id="phone" 
              name="phone" 
              className="col-span-3" 
              defaultValue={ustadz.phone || ''}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right">
              Alamat
            </Label>
            <Input 
              id="address" 
              name="address" 
              className="col-span-3" 
              defaultValue={ustadz.address || ''}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="birthPlace" className="text-right">
              Tempat Lahir
            </Label>
            <Input 
              id="birthPlace" 
              name="birthPlace" 
              className="col-span-3" 
              defaultValue={ustadz.birthPlace || ''}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="birthDate" className="text-right">
              Tanggal Lahir
            </Label>
            <Input 
              id="birthDate" 
              name="birthDate" 
              type="date" 
              className="col-span-3" 
              defaultValue={ustadz.birthDate ? new Date(ustadz.birthDate).toISOString().split('T')[0] : ''}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="specialization" className="text-right">
              Spesialisasi
            </Label>
            <Input 
              id="specialization" 
              name="specialization" 
              className="col-span-3" 
              placeholder="e.g. Tahfidz, Fiqh" 
              defaultValue={ustadz.specialization || ''}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="education" className="text-right">
              Pendidikan
            </Label>
            <Input 
              id="education" 
              name="education" 
              className="col-span-3" 
              placeholder="e.g. S1 PAI" 
              defaultValue={ustadz.education || ''}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select name="status" defaultValue={ustadz.status}>
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Aktif</SelectItem>
                <SelectItem value="INACTIVE">Tidak Aktif</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

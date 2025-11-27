'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { updateAsrama } from "@/actions/asrama-actions"
import { useState } from "react"
import { Pencil } from "lucide-react"

export function EditAsramaDialog({ asrama }: { asrama: any }) {
  const [open, setOpen] = useState(false)

  async function handleSubmit(formData: FormData) {
    const res = await updateAsrama(asrama.id, formData)
    if (res.success) {
      setOpen(false)
    } else {
      alert('Gagal mengupdate asrama')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Asrama</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-4 py-4">
          <div>
            <Label htmlFor="name">Nama Asrama *</Label>
            <Input id="name" name="name" defaultValue={asrama.name} required />
          </div>
          <div>
            <Label htmlFor="capacity">Kapasitas *</Label>
            <Input 
              id="capacity" 
              name="capacity" 
              type="number" 
              min="1" 
              defaultValue={asrama.capacity}
              required 
            />
          </div>
          <div>
            <Label htmlFor="gender">Jenis Kelamin *</Label>
            <Select name="gender" defaultValue={asrama.gender || undefined} required>
              <SelectTrigger>
                <SelectValue placeholder="Pilih" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L">Laki-laki</SelectItem>
                <SelectItem value="P">Perempuan</SelectItem>
                <SelectItem value="MIXED">Campuran</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="address">Alamat</Label>
            <Input id="address" name="address" defaultValue={asrama.address || ''} />
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

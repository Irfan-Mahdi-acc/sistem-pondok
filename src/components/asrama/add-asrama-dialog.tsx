'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { createAsrama } from "@/actions/asrama-actions"
import { useState } from "react"
import { Plus } from "lucide-react"

export function AddAsramaDialog() {
  const [open, setOpen] = useState(false)
  const [gender, setGender] = useState<string>('')

  async function handleSubmit(formData: FormData) {
    // Ensure gender is in formData
    if (gender) {
      formData.set('gender', gender)
    }
    
    const res = await createAsrama(formData)
    if (res.success) {
      setOpen(false)
      setGender('')
    } else {
      console.error('Create asrama error:', res.error)
      const errorMsg = typeof res.error === 'string' 
        ? res.error 
        : JSON.stringify(res.error, null, 2)
      alert('Gagal membuat asrama:\n' + errorMsg)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-1" />
          Tambah Asrama
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tambah Asrama Baru</DialogTitle>
          <DialogDescription>
            Isi formulir untuk menambahkan asrama baru
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-4 py-4">
          <div>
            <Label htmlFor="name">Nama Asrama *</Label>
            <Input id="name" name="name" required />
          </div>
          <div>
            <Label htmlFor="capacity">Kapasitas *</Label>
            <Input id="capacity" name="capacity" type="number" min="1" required />
          </div>
          <div>
            <Label htmlFor="gender">Jenis Kelamin *</Label>
            <Select name="gender" value={gender} onValueChange={setGender} required>
              <SelectTrigger>
                <SelectValue placeholder="Pilih" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L">Laki-laki</SelectItem>
                <SelectItem value="P">Perempuan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="address">Alamat</Label>
            <Input id="address" name="address" />
          </div>
          <div className="flex justify-end">
            <Button type="submit">Buat Asrama</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { useState } from 'react'
import { createAsset } from '@/actions/inventaris-actions'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'

export function AddAssetDialog() {
  const [open, setOpen] = useState(false)

  async function handleSubmit(formData: FormData) {
    const result = await createAsset(formData)
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
          Tambah Aset
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tambah Aset Baru</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Aset *</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Kode Aset</Label>
              <Input id="code" name="code" placeholder="AST-001" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Kategori *</Label>
              <Select name="category" required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ELEKTRONIK">Elektronik</SelectItem>
                  <SelectItem value="FURNITURE">Furniture</SelectItem>
                  <SelectItem value="KENDARAAN">Kendaraan</SelectItem>
                  <SelectItem value="BANGUNAN">Bangunan</SelectItem>
                  <SelectItem value="ALAT_OLAHRAGA">Alat Olahraga</SelectItem>
                  <SelectItem value="ALAT_MUSIK">Alat Musik</SelectItem>
                  <SelectItem value="LAINNYA">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="condition">Kondisi *</Label>
              <Select name="condition" required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kondisi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GOOD">Baik</SelectItem>
                  <SelectItem value="DAMAGED">Rusak</SelectItem>
                  <SelectItem value="LOST">Hilang</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Lokasi</Label>
            <Input id="location" name="location" placeholder="Ruang Kelas 1A" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Tanggal Pembelian</Label>
              <Input id="purchaseDate" name="purchaseDate" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Harga</Label>
              <Input id="price" name="price" type="number" placeholder="0" />
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



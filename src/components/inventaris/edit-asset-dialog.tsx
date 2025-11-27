'use client'

import { useState } from 'react'
import { updateAsset } from '@/actions/inventaris-actions'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

type Asset = {
  id: string
  name: string
  code: string | null
  category: string
  condition: string
  location: string | null
  purchaseDate: Date | null
  price: number | null
}

export function EditAssetDialog({
  asset,
  open,
  onOpenChange,
}: {
  asset: Asset
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  async function handleSubmit(formData: FormData) {
    const result = await updateAsset(asset.id, formData)
    if (result.success) {
      onOpenChange(false)
    } else {
      alert(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Aset</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Aset *</Label>
              <Input id="name" name="name" defaultValue={asset.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Kode Aset</Label>
              <Input id="code" name="code" defaultValue={asset.code || ''} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Kategori *</Label>
              <Select name="category" defaultValue={asset.category} required>
                <SelectTrigger>
                  <SelectValue />
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
              <Select name="condition" defaultValue={asset.condition} required>
                <SelectTrigger>
                  <SelectValue />
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
            <Input id="location" name="location" defaultValue={asset.location || ''} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Tanggal Pembelian</Label>
              <Input
                id="purchaseDate"
                name="purchaseDate"
                type="date"
                defaultValue={
                  asset.purchaseDate
                    ? new Date(asset.purchaseDate).toISOString().split('T')[0]
                    : ''
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Harga</Label>
              <Input
                id="price"
                name="price"
                type="number"
                defaultValue={asset.price || ''}
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



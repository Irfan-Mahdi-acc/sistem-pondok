'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImageUpload } from "@/components/ui/image-upload"
import { updateLembaga } from "@/actions/lembaga-actions"
import { uploadImage } from "@/actions/upload-actions"

export function EditLembagaDialog({ 
  lembaga, 
  open, 
  onOpenChange 
}: { 
  lembaga: any
  open: boolean
  onOpenChange: (open: boolean) => void 
}) {
  const [loading, setLoading] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(lembaga.logoUrl || null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      
      // Upload new logo if file selected
      if (logoFile) {
        const uploadFormData = new FormData()
        uploadFormData.append('file', logoFile)
        const uploadResult = await uploadImage(uploadFormData)
        
        if (uploadResult.success && uploadResult.url) {
          formData.set('logoUrl', uploadResult.url)
        }
      } else if (logoPreview) {
        // Keep existing logo URL if no new file
        formData.set('logoUrl', logoPreview)
      }

      const res = await updateLembaga(lembaga.id, formData)
      if (res.success) {
        onOpenChange(false)
        setLogoFile(null)
      } else {
        alert('Gagal mengupdate: ' + (res.error || 'Unknown error'))
      }
    } catch (error) {
      alert('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Lembaga</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nama *
            </Label>
            <Input id="name" name="name" defaultValue={lembaga.name} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right">
              Alamat
            </Label>
            <Input id="address" name="address" defaultValue={lembaga.address || ''} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Telepon
            </Label>
            <Input id="phone" name="phone" defaultValue={lembaga.phone || ''} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input id="email" name="email" type="email" defaultValue={lembaga.email || ''} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tags" className="text-right">
              Tags
            </Label>
            <Input 
              id="tags" 
              name="tags" 
              defaultValue={lembaga.tags || ''}
              className="col-span-3" 
              placeholder="Pisahkan dengan koma, contoh: Putra, Formal"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">
              Logo
            </Label>
            <div className="col-span-3">
              <ImageUpload
                value={logoPreview || undefined}
                onChange={(file, preview) => {
                  setLogoFile(file)
                  setLogoPreview(preview)
                }}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

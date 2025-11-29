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
import { ImageUpload } from "@/components/ui/image-upload"
import { createLembaga } from "@/actions/lembaga-actions"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function AddLembagaDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string>('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      
      // Set logo URL if exists
      if (logoUrl) {
        formData.set('logoUrl', logoUrl)
      } else {
        formData.set('logoUrl', '')
      }

      const res = await createLembaga(formData)
      console.log('Create lembaga result:', res)
      
      if (res.success) {
        setLogoUrl('')
        setOpen(false)
        router.refresh() // Refresh to show the new lembaga
        // Form will auto-reset when dialog closes
      } else {
        console.error('Create lembaga error:', res.error)
        alert('Gagal membuat lembaga: ' + (res.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Exception creating lembaga:', error)
      alert('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Tambah Lembaga</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tambah Lembaga Baru</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nama *
            </Label>
            <Input id="name" name="name" className="col-span-3" required placeholder="contoh: Pondok Putra" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right">
              Alamat
            </Label>
            <Input id="address" name="address" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Telepon
            </Label>
            <Input id="phone" name="phone" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input id="email" name="email" type="email" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tags" className="text-right">
              Tags
            </Label>
            <Input 
              id="tags" 
              name="tags" 
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
                value={logoUrl || undefined}
                onChange={(url) => setLogoUrl(url)}
                onRemove={() => setLogoUrl('')}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

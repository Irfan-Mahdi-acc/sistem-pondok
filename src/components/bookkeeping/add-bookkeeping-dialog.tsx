'use client'

import { useState } from 'react'
import { createBookkeeping } from '@/actions/bookkeeping-management-actions'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Lembaga = {
  id: string
  name: string
}

export function AddBookkeepingDialog({ lembagas }: { lembagas: Lembaga[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState('UMUM')

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const result = await createBookkeeping(formData)
    
    if (result.success) {
      setOpen(false)
      router.refresh()
    } else {
      alert(result.error)
    }
    
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Pembukuan
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Pembukuan Baru</DialogTitle>
          <DialogDescription>
            Buat pembukuan umum, per-lembaga, atau custom
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Pembukuan *</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g., Pembukuan Umum Pondok"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipe *</Label>
            <Select name="type" value={type} onValueChange={setType} required disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UMUM">Umum (Pondok-wide)</SelectItem>
                <SelectItem value="LEMBAGA">Per Lembaga</SelectItem>
                <SelectItem value="CUSTOM">Custom</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {type === 'UMUM' && 'Pembukuan umum untuk seluruh pondok'}
              {type === 'LEMBAGA' && 'Pembukuan khusus untuk satu lembaga'}
              {type === 'CUSTOM' && 'Pembukuan custom untuk kebutuhan khusus'}
            </p>
          </div>

          {type === 'LEMBAGA' && (
            <div className="space-y-2">
              <Label htmlFor="lembagaId">Lembaga *</Label>
              <Select name="lembagaId" required disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih lembaga" />
                </SelectTrigger>
                <SelectContent>
                  {lembagas.map((lembaga) => (
                    <SelectItem key={lembaga.id} value={lembaga.id}>
                      {lembaga.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Deskripsi singkat pembukuan ini..."
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}


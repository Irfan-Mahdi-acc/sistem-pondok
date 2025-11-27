'use client'

import { useState } from 'react'
import { updateBookkeeping } from '@/actions/bookkeeping-management-actions'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { useRouter } from 'next/navigation'

type Bookkeeping = {
  id: string
  name: string
  description: string | null
  status: string
}

export function EditBookkeepingDialog({
  bookkeeping,
  open,
  onOpenChange,
}: {
  bookkeeping: Bookkeeping
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    const result = await updateBookkeeping(bookkeeping.id, formData)
    
    if (result.success) {
      onOpenChange(false)
      router.refresh()
    } else {
      alert(result.error)
    }
    
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Pembukuan</DialogTitle>
          <DialogDescription>
            Update informasi pembukuan
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Pembukuan *</Label>
            <Input
              id="name"
              name="name"
              defaultValue={bookkeeping.name}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={bookkeeping.description || ''}
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select name="status" defaultValue={bookkeeping.status} required disabled={loading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Aktif</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
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


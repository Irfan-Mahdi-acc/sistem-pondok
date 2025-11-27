'use client'

import { useState } from 'react'
import { updateProfile } from '@/actions/profile-actions'
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
import { Pencil } from 'lucide-react'
import { useRouter } from 'next/navigation'

type User = {
  id: string
  name: string
  username: string
  avatarUrl: string | null
}

export function EditProfileDialog({ user }: { user: User }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    
    const data = {
      name: formData.get('name') as string,
      avatarUrl: formData.get('avatarUrl') as string || null,
    }

    const result = await updateProfile(data)
    
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
        <Button variant="outline" size="sm">
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profil</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap *</Label>
            <Input
              id="name"
              name="name"
              defaultValue={user.name}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={user.username}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Username tidak dapat diubah
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatarUrl">URL Avatar</Label>
            <Input
              id="avatarUrl"
              name="avatarUrl"
              defaultValue={user.avatarUrl || ''}
              placeholder="/uploads/avatar.jpg"
            />
          </div>

          <div className="flex justify-end gap-2">
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


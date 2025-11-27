'use client'

import { useState } from 'react'
import { changePassword } from '@/actions/profile-actions'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Key, Eye, EyeOff } from 'lucide-react'

export function ChangePasswordDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const currentPassword = formData.get('currentPassword') as string
    const newPassword = formData.get('newPassword') as string
    const confirmPassword = formData.get('confirmPassword') as string

    // Validation
    if (newPassword.length < 6) {
      alert('Password baru minimal 6 karakter')
      setLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      alert('Konfirmasi password tidak sesuai')
      setLoading(false)
      return
    }

    const result = await changePassword({
      currentPassword,
      newPassword
    })
    
    if (result.success) {
      alert('Password berhasil diubah!')
      setOpen(false)
      e.currentTarget.reset()
    } else {
      alert(result.error)
    }
    
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Key className="mr-2 h-4 w-4" />
          Ubah
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ubah Password</DialogTitle>
          <DialogDescription>
            Masukkan password lama dan password baru Anda
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Password Lama *</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                name="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Password Baru *</Label>
            <div className="relative">
              <Input
                id="newPassword"
                name="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                minLength={6}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Minimal 6 karakter
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi Password Baru *</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                minLength={6}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
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
              {loading ? 'Mengubah...' : 'Ubah Password'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}


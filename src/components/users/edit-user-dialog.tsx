'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { X, Eye, EyeOff } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface EditUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: any
  onSave: (userId: string, data: { name: string; username: string; roles: string[]; password?: string }) => Promise<void>
}

const AVAILABLE_ROLES = [
  'ADMIN',
  'USTADZ',
  'PENGURUS',
  'MUSYRIF',
  'ADMIN_KANTOR',
  'WALI_SANTRI',
  'SANTRI',
  'BENDAHARA',
]

export function EditUserDialog({ open, onOpenChange, user, onSave }: EditUserDialogProps) {
  const [name, setName] = useState(user.name)
  const [username, setUsername] = useState(user.username)
  const [selectedRoles, setSelectedRoles] = useState<string[]>(() => {
    try {
      return user.roles ? JSON.parse(user.roles) : [user.role]
    } catch {
      return [user.role]
    }
  })
  const [resetPassword, setResetPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleAddRole = (role: string) => {
    if (!selectedRoles.includes(role)) {
      setSelectedRoles([...selectedRoles, role])
    }
  }

  const handleRemoveRole = (role: string) => {
    setSelectedRoles(selectedRoles.filter(r => r !== role))
  }

  const handleSave = async () => {
    if (selectedRoles.length === 0) {
      alert('Pilih minimal 1 role')
      return
    }

    if (resetPassword && !newPassword) {
      alert('Masukkan password baru')
      return
    }

    setLoading(true)
    try {
      const data: any = { name, username, roles: selectedRoles }
      if (resetPassword && newPassword) {
        data.password = newPassword
      }
      await onSave(user.id, data)
      onOpenChange(false)
    } catch (error) {
      alert('Gagal menyimpan perubahan')
    } finally {
      setLoading(false)
    }
  }

  const availableRolesToAdd = AVAILABLE_ROLES.filter(r => !selectedRoles.includes(r))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama lengkap"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
            />
          </div>

          <div className="space-y-2">
            <Label>Roles</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedRoles.map((role) => (
                <Badge key={role} variant="default" className="gap-1">
                  {role}
                  <button
                    type="button"
                    onClick={() => handleRemoveRole(role)}
                    className="ml-1 hover:bg-white/20 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {selectedRoles.length === 0 && (
                <p className="text-sm text-muted-foreground">Belum ada role dipilih</p>
              )}
            </div>

            {availableRolesToAdd.length > 0 && (
              <Select onValueChange={handleAddRole}>
                <SelectTrigger>
                  <SelectValue placeholder="+ Tambah role" />
                </SelectTrigger>
                <SelectContent>
                  {availableRolesToAdd.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="reset-password"
                checked={resetPassword}
                onCheckedChange={(checked) => setResetPassword(checked as boolean)}
              />
              <Label htmlFor="reset-password" className="cursor-pointer">
                Reset Password
              </Label>
            </div>

            {resetPassword && (
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Password baru"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

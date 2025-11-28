'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { approveUser } from "@/actions/user-approval-actions"
import { useToast } from "@/components/ui/toast"

type PendingUser = {
  id: string
  username: string
  name: string
  email: string | null
  role: string
}

type ApproveUserDialogProps = {
  user: PendingUser
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ApproveUserDialog({ user, open, onOpenChange }: ApproveUserDialogProps) {
  const [role, setRole] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()
  const router = useRouter()

  const handleApprove = async () => {
    if (!role) {
      showToast("Pilih role terlebih dahulu", "error")
      return
    }

    setLoading(true)
    const result = await approveUser(user.id, role)
    
    if (result.success) {
      showToast("User berhasil disetujui", "success")
      onOpenChange(false)
      router.refresh()
    } else {
      showToast(result.error || "Gagal menyetujui user", "error")
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Setujui Pendaftaran</DialogTitle>
          <DialogDescription>
            Assign role untuk user <strong>{user.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Informasi User</Label>
            <div className="rounded-lg bg-muted p-3 space-y-1 text-sm">
              <p><strong>Nama:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email || '-'}</p>
              <p><strong>Username:</strong> {user.username}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Pilih Role *</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Pilih role..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SANTRI">Santri</SelectItem>
                <SelectItem value="USTADZ">Ustadz</SelectItem>
                <SelectItem value="MUSYRIF">Musyrif</SelectItem>
                <SelectItem value="PENGURUS">Pengurus</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="SUPERADMIN">Super Admin</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Setelah disetujui, user dapat login dan mengakses sistem sesuai role yang diberikan
            </p>
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
            <Button
              onClick={handleApprove}
              disabled={loading || !role}
            >
              {loading ? 'Menyetujui...' : 'Setujui & Assign'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

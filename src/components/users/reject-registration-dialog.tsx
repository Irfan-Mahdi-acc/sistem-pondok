'use client'

import { useState } from 'react'
import { rejectRegistration } from '@/actions/registration-actions'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { XCircle } from 'lucide-react'

type Registration = {
  id: string
  name: string
  username: string
}

export function RejectRegistrationDialog({
  registration,
  adminId,
  open,
  onOpenChange,
}: {
  registration: Registration
  adminId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState('')

  async function handleReject() {
    setLoading(true)
    const result = await rejectRegistration(registration.id, adminId, notes)

    if (result.success) {
      onOpenChange(false)
      setNotes('')
    } else {
      alert(result.error)
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            Tolak Pendaftaran
          </DialogTitle>
          <DialogDescription>
            Berikan alasan penolakan untuk pendaftaran ini
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm">
            <p className="text-muted-foreground">Nama:</p>
            <p className="font-medium">{registration.name}</p>
            <p className="text-muted-foreground mt-2">Username:</p>
            <p className="font-mono font-medium">{registration.username}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Catatan Penolakan</Label>
            <Textarea
              id="notes"
              placeholder="Jelaskan alasan penolakan (opsional)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={loading}>
              {loading ? 'Memproses...' : 'Tolak Pendaftaran'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


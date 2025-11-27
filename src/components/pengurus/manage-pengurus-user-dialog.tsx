'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { linkPengurusToUser, getAvailablePengurusUsers } from "@/actions/pengurus-actions"
import { Loader2 } from "lucide-react"

export function ManagePengurusUserDialog({ 
  pengurus, 
  open, 
  onOpenChange 
}: { 
  pengurus: any
  open: boolean
  onOpenChange: (open: boolean) => void 
}) {
  const [loading, setLoading] = useState(false)
  const [availableUsers, setAvailableUsers] = useState<any[]>([])
  const [selectedUserId, setSelectedUserId] = useState('')

  useEffect(() => {
    if (open) {
      loadAvailableUsers()
    }
  }, [open])

  const loadAvailableUsers = async () => {
    const users = await getAvailablePengurusUsers()
    setAvailableUsers(users)
  }

  const handleLink = async () => {
    if (!selectedUserId) {
      alert('Pilih user terlebih dahulu')
      return
    }

    setLoading(true)
    try {
      const result = await linkPengurusToUser(pengurus.id, selectedUserId)
      if (result.success) {
        alert('Berhasil menghubungkan ke user')
        onOpenChange(false)
      } else {
        alert('Gagal: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      alert('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const isLinked = pengurus.user && !pengurus.user.username.startsWith('temp_')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Kelola Hubungan User - Pengurus</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Pengurus</Label>
            <div className="rounded-md border p-3">
              <p className="font-medium">{pengurus.user.name}</p>
              <p className="text-sm text-muted-foreground">NIK: {pengurus.nik || '-'}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status Hubungan</Label>
            <div>
              {isLinked ? (
                <Badge variant="default">Terhubung ke: {pengurus.user.username}</Badge>
              ) : (
                <Badge variant="secondary">Belum terhubung</Badge>
              )}
            </div>
          </div>

          {!isLinked && (
            <>
              <div className="space-y-2">
                <Label>Hubungkan ke User</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih user..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.length === 0 ? (
                      <SelectItem value="none" disabled>
                        Tidak ada user tersedia
                      </SelectItem>
                    ) : (
                      availableUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.username})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  User dengan role PENGURUS yang belum terhubung
                </p>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleLink} disabled={loading || !selectedUserId}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Hubungkan
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

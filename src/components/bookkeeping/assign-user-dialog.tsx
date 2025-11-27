'use client'

import { useState, useEffect } from 'react'
import { 
  assignUserToBookkeeping, 
  removeUserFromBookkeeping,
  getAvailableUsersForBookkeeping,
  getBookkeepingById
} from '@/actions/bookkeeping-management-actions'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Trash2, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Bookkeeping = {
  id: string
  name: string
}

export function AssignUserDialog({
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
  const [users, setUsers] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedRole, setSelectedRole] = useState<'MANAGER' | 'EDITOR' | 'VIEWER'>('VIEWER')

  useEffect(() => {
    if (open) {
      getAvailableUsersForBookkeeping().then(setUsers)
      // Fetch bookkeeping data with assignments
      getBookkeepingById(bookkeeping.id).then(data => {
        if (data) {
          setAssignments(data.assignments || [])
        }
      })
    }
  }, [open, bookkeeping.id])

  async function handleAssign() {
    if (!selectedUserId) return

    setLoading(true)
    const result = await assignUserToBookkeeping(bookkeeping.id, selectedUserId, selectedRole)
    
    if (result.success) {
      setSelectedUserId('')
      setSelectedRole('VIEWER')
      // Refresh assignments
      const data = await getBookkeepingById(bookkeeping.id)
      if (data) setAssignments(data.assignments || [])
      router.refresh()
    } else {
      alert(result.error)
    }
    
    setLoading(false)
  }

  async function handleRemove(assignmentId: string) {
    if (!confirm('Hapus assignment ini?')) return

    setLoading(true)
    const result = await removeUserFromBookkeeping(assignmentId)
    
    if (result.success) {
      // Refresh assignments
      const data = await getBookkeepingById(bookkeeping.id)
      if (data) setAssignments(data.assignments || [])
      router.refresh()
    } else {
      alert(result.error)
    }
    
    setLoading(false)
  }

  const getRoleBadge = (role: string) => {
    const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
      MANAGER: { label: 'Manager', variant: 'default' },
      EDITOR: { label: 'Editor', variant: 'secondary' },
      VIEWER: { label: 'Viewer', variant: 'outline' },
    }
    const config = variants[role] || { label: role, variant: 'default' }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  // Filter users yang belum di-assign
  const assignedUserIds = assignments.map(a => a.user.id)
  const availableUsers = users.filter(u => !assignedUserIds.includes(u.id))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Kelola Pengurus</DialogTitle>
          <DialogDescription>
            Pembukuan: {bookkeeping.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Assignments */}
          <div>
            <h4 className="font-medium mb-3">Pengurus Saat Ini</h4>
            {assignments.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada pengurus yang di-assign</p>
            ) : (
              <div className="space-y-2">
                {assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium">{assignment.user.name}</div>
                        <div className="text-xs text-muted-foreground">{assignment.user.username}</div>
                      </div>
                      {getRoleBadge(assignment.role)}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(assignment.id)}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Assignment */}
          <div className="border-t pt-6">
            <h4 className="font-medium mb-3">Tambah Pengurus</h4>
            {availableUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Semua user sudah di-assign atau belum ada user lain yang tersedia
              </p>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Pilih User</Label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId} disabled={loading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih user..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.username}) - {user.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={selectedRole} onValueChange={(v: any) => setSelectedRole(v)} disabled={loading}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MANAGER">Manager - Full access + assign</SelectItem>
                      <SelectItem value="EDITOR">Editor - View + Edit</SelectItem>
                      <SelectItem value="VIEWER">Viewer - View only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleAssign} disabled={!selectedUserId || loading} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  {loading ? 'Menambahkan...' : 'Tambah Pengurus'}
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Tutup
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


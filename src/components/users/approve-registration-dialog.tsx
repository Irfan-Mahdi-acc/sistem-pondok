'use client'

import { useState, useEffect } from 'react'
import { approveRegistration } from '@/actions/registration-actions'
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
import { CheckCircle, AlertCircle, Info } from 'lucide-react'

type Registration = {
  id: string
  name: string
  username: string
  requestedRole: string
  reason: string | null
}

type UstadzProfile = {
  id: string
  user: { name: string } | null
  lembagaAsMudir?: { id: string; name: string }[]
  homeroomClasses?: { id: string; lembagaId: string }[]
  mapels?: { id: string; kelas: { lembagaId: string } }[]
  halqohs?: { id: string }[]
}

export function ApproveRegistrationDialog({
  registration,
  ustadzList,
  adminId,
  open,
  onOpenChange,
}: {
  registration: Registration
  ustadzList: UstadzProfile[]
  adminId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [assignToProfileId, setAssignToProfileId] = useState<string>('')
  const [defaultPassword, setDefaultPassword] = useState('')
  const [assignedRoles, setAssignedRoles] = useState<string[]>([])
  const [detectedRoles, setDetectedRoles] = useState<string[]>([])

  // Check if role needs profile assignment
  const needsProfileAssignment = ['USTADZ', 'MUDIR', 'PENGURUS', 'MUSYRIF'].includes(
    registration.requestedRole
  )

  // Filter available profiles (those without user)
  const availableProfiles = ustadzList.filter((p) => !p.user)

  // Detect roles from selected profile
  useEffect(() => {
    if (assignToProfileId) {
      const profile = ustadzList.find((p) => p.id === assignToProfileId)
      if (profile) {
        const roles: string[] = []
        
        if (profile.lembagaAsMudir && profile.lembagaAsMudir.length > 0) {
          roles.push('MUDIR')
        }
        if (profile.mapels && profile.mapels.length > 0) {
          roles.push('USTADZ')
        }
        if (profile.halqohs && profile.halqohs.length > 0) {
          roles.push('MUSYRIF')
        }
        if (profile.homeroomClasses && profile.homeroomClasses.length > 0) {
          roles.push('USTADZ')
        }

        setDetectedRoles(Array.from(new Set(roles)))
      }
    } else {
      setDetectedRoles([])
    }
  }, [assignToProfileId, ustadzList])

  async function handleApprove() {
    setLoading(true)
    const result = await approveRegistration(
      registration.id,
      adminId,
      assignToProfileId || undefined
    )

    if (result.success) {
      setSuccess(true)
      setDefaultPassword(result.defaultPassword || 'password123')
      setAssignedRoles(result.assignedRoles || [registration.requestedRole])
      setTimeout(() => {
        onOpenChange(false)
        setSuccess(false)
        setAssignToProfileId('')
        setDetectedRoles([])
        setAssignedRoles([])
      }, 5000)
    } else {
      alert(result.error)
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {success ? (
          <div className="text-center space-y-4 py-4">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
            <div>
              <h2 className="text-xl font-bold text-green-900 dark:text-green-100 mb-2">
                Pendaftaran Disetujui!
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Akun berhasil dibuat untuk <strong>{registration.name}</strong>
              </p>
              
              {assignedRoles.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-2">Role yang diberikan:</p>
                  <div className="flex flex-wrap gap-2">
                    {assignedRoles.map((role) => (
                      <Badge key={role} variant="secondary">{role}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-muted-foreground mb-2">Password Default:</p>
                <p className="font-mono text-lg font-bold text-blue-600 dark:text-blue-400">
                  {defaultPassword}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Berikan password ini kepada user untuk login pertama kali
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Setujui Pendaftaran</DialogTitle>
              <DialogDescription>
                Verifikasi informasi dan setujui pendaftaran akun baru
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Nama:</p>
                  <p className="font-medium">{registration.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Username:</p>
                  <p className="font-mono font-medium">{registration.username}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Role Diminta:</p>
                  <p className="font-medium">{registration.requestedRole}</p>
                </div>
                {registration.reason && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Alasan:</p>
                    <p className="text-sm">{registration.reason}</p>
                  </div>
                )}
              </div>

              {needsProfileAssignment && availableProfiles.length > 0 && (
                <div className="space-y-2 pt-4 border-t">
                  <Label>Hubungkan dengan Profile (Opsional)</Label>
                  <Select value={assignToProfileId} onValueChange={setAssignToProfileId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih profile..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tidak dihubungkan</SelectItem>
                      {availableProfiles.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          Profile ID: {profile.id.slice(0, 8)}...
                          {profile.lembagaAsMudir && profile.lembagaAsMudir.length > 0 && (
                            <span className="text-xs text-muted-foreground ml-2">
                              (Mudir)
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Pilih profile ustadz/pengurus yang akan dihubungkan dengan akun ini
                  </p>
                  
                  {detectedRoles.length > 0 && (
                    <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-200 dark:border-green-800 flex gap-2">
                      <Info className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <p className="font-medium text-green-900 dark:text-green-100 mb-1">
                          Role otomatis terdeteksi:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {detectedRoles.map((role) => (
                            <Badge key={role} variant="secondary" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-muted-foreground mt-1">
                          Role akan ditambahkan berdasarkan assignment profile
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800 flex gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium mb-1">Password Default:</p>
                  <p>
                    Akun akan dibuat dengan password default <strong>password123</strong>.
                    User dapat mengubah password setelah login.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                  Batal
                </Button>
                <Button onClick={handleApprove} disabled={loading}>
                  {loading ? 'Memproses...' : 'Setujui Pendaftaran'}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}


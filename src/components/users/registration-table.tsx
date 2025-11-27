'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, CheckCircle, XCircle, Eye } from 'lucide-react'
import { approveRegistration, rejectRegistration } from '@/actions/registration-actions'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { useState } from 'react'
import { ApproveRegistrationDialog } from './approve-registration-dialog'
import { RejectRegistrationDialog } from './reject-registration-dialog'
import { useSession } from 'next-auth/react'

type Registration = {
  id: string
  name: string
  username: string
  email: string | null
  phone: string | null
  requestedRole: string
  reason: string | null
  status: string
  createdAt: Date
  reviewedAt: Date | null
  reviewNotes: string | null
}

type UstadzProfile = {
  id: string
  user: { name: string } | null
}

export function RegistrationTable({ 
  registrations,
  ustadzList,
  readOnly = false 
}: { 
  registrations: Registration[]
  ustadzList: UstadzProfile[]
  readOnly?: boolean
}) {
  const { data: session } = useSession()
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)

  function getStatusBadge(status: string) {
    const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
      PENDING: { label: 'Menunggu', variant: 'default' },
      APPROVED: { label: 'Disetujui', variant: 'secondary' },
      REJECTED: { label: 'Ditolak', variant: 'destructive' },
    }
    const config = variants[status] || { label: status, variant: 'default' }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const approvingRegistration = registrations.find(r => r.id === approvingId)
  const rejectingRegistration = registrations.find(r => r.id === rejectingId)

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Kontak</TableHead>
              <TableHead>Role Diminta</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tanggal</TableHead>
              {!readOnly && <TableHead className="text-right">Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {registrations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={readOnly ? 6 : 7} className="text-center text-muted-foreground py-8">
                  Tidak ada data pendaftaran
                </TableCell>
              </TableRow>
            ) : (
              registrations.map((reg) => (
                <TableRow key={reg.id}>
                  <TableCell className="font-medium">{reg.name}</TableCell>
                  <TableCell className="font-mono text-sm">{reg.username}</TableCell>
                  <TableCell className="text-sm">
                    {reg.email && <div>{reg.email}</div>}
                    {reg.phone && <div className="text-muted-foreground">{reg.phone}</div>}
                    {!reg.email && !reg.phone && <span className="text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{reg.requestedRole}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(reg.status)}</TableCell>
                  <TableCell className="whitespace-nowrap text-sm">
                    {format(new Date(reg.createdAt), 'dd MMM yyyy', { locale: localeId })}
                  </TableCell>
                  {!readOnly && (
                    <TableCell className="text-right">
                      {reg.status === 'PENDING' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setApprovingId(reg.id)}>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                              Setujui
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setRejectingId(reg.id)}>
                              <XCircle className="mr-2 h-4 w-4 text-red-600" />
                              Tolak
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {approvingRegistration && (
        <ApproveRegistrationDialog
          registration={approvingRegistration}
          ustadzList={ustadzList}
          adminId={session?.user?.id || ''}
          open={!!approvingId}
          onOpenChange={(open) => !open && setApprovingId(null)}
        />
      )}

      {rejectingRegistration && (
        <RejectRegistrationDialog
          registration={rejectingRegistration}
          adminId={session?.user?.id || ''}
          open={!!rejectingId}
          onOpenChange={(open) => !open && setRejectingId(null)}
        />
      )}
    </>
  )
}


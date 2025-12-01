'use client'

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, UserPlus } from "lucide-react"
import { AssignApplicantDialog } from "./assign-applicant-dialog"
import { updatePSBRegistrationStatus } from "@/actions/psb-actions"
import { toast } from "sonner"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface ApplicantTableProps {
  registrations: any[]
  lembagas: Array<{ id: string; name: string }>
  allKelas: Array<{ id: string; name: string; lembagaId: string }>
}

export function ApplicantTable({ registrations, lembagas, allKelas }: ApplicantTableProps) {
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [selectedRegistration, setSelectedRegistration] = useState<any>(null)

  const handleStatusChange = async (id: string, status: string) => {
    const result = await updatePSBRegistrationStatus(id, status)
    if (result.success) {
      toast.success(`Status berhasil diubah menjadi ${status}`)
    } else {
      toast.error("Gagal mengubah status")
    }
  }

  const handleAssignClick = (registration: any) => {
    setSelectedRegistration(registration)
    setAssignDialogOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'default'
      case 'ASSIGNED': return 'default'
      case 'ACCEPTED': return 'default'
      case 'REJECTED': return 'destructive'
      case 'DECLINED': return 'destructive'
      case 'INTERVIEW': return 'secondary'
      case 'PAYMENT_VERIFIED': return 'secondary'
      default: return 'outline'
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'PENDING': 'Menunggu',
      'PAYMENT_VERIFIED': 'Bayar Terverifikasi',
      'INTERVIEW': 'Interview',
      'ACCEPTED': 'Diterima',
      'ASSIGNED': 'Sudah Di-assign',
      'REREGISTRATION_PENDING': 'Menunggu Daftar Ulang',
      'CONFIRMED': 'Terkonfirmasi',
      'REJECTED': 'Ditolak',
      'DECLINED': 'Menolak',
    }
    return labels[status] || status
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No. Pendaftaran</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Gelombang</TableHead>
              <TableHead>Status Bayar</TableHead>
              <TableHead>Lembaga</TableHead>
              <TableHead>Kelas</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registrations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                  Belum ada pendaftar.
                </TableCell>
              </TableRow>
            ) : (
              registrations.map((reg) => (
                <TableRow key={reg.id}>
                  <TableCell className="font-medium">{reg.registrationNo}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{reg.name}</span>
                      <span className="text-xs text-muted-foreground">{reg.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">{reg.period?.name || '-'}</span>
                      <span className="text-xs text-muted-foreground">{reg.period?.lembaga?.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={reg.paymentStatus === 'VERIFIED' ? 'default' : 'outline'} className="text-xs">
                      {reg.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>{reg.assignedLembaga?.name || '-'}</TableCell>
                  <TableCell>{reg.assignedKelas?.name || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(reg.status) as any}>
                      {getStatusLabel(reg.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {reg.status === 'ACCEPTED' && !reg.assignedLembagaId && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAssignClick(reg)}
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Assign
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(reg.registrationNo)}>
                            Copy No. Pendaftaran
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Ubah Status</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleStatusChange(reg.id, 'PENDING')}>
                            Pending
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(reg.id, 'PAYMENT_VERIFIED')}>
                            Payment Verified
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(reg.id, 'INTERVIEW')}>
                            Interview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(reg.id, 'ACCEPTED')}>
                            Diterima
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(reg.id, 'REJECTED')}>
                            Ditolak
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedRegistration && (
        <AssignApplicantDialog
          registration={selectedRegistration}
          lembagas={lembagas}
          allKelas={allKelas}
          open={assignDialogOpen}
          onOpenChange={setAssignDialogOpen}
        />
      )}
    </>
  )
}

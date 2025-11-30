'use client'

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
import { MoreHorizontal } from "lucide-react"
import { updatePSBRegistrationStatus } from "@/actions/psb-actions"
import { toast } from "sonner"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface ApplicantTableProps {
  registrations: any[]
}

export function ApplicantTable({ registrations }: ApplicantTableProps) {
  const handleStatusChange = async (id: string, status: string) => {
    const result = await updatePSBRegistrationStatus(id, status)
    if (result.success) {
      toast.success(`Status berhasil diubah menjadi ${status}`)
    } else {
      toast.error("Gagal mengubah status")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'default' // or 'success' if available
      case 'REJECTED': return 'destructive'
      case 'INTERVIEW': return 'secondary' // or 'warning'
      case 'WAITLIST': return 'outline'
      default: return 'secondary'
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>No. Pendaftaran</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Gelombang</TableHead>
            <TableHead>Tanggal Daftar</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registrations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
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
                <TableCell>{reg.period?.name || '-'}</TableCell>
                <TableCell>{format(new Date(reg.createdAt), "d MMM yyyy", { locale: id })}</TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(reg.status) as any}>
                    {reg.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => navigator.clipboard.writeText(reg.id)}>
                        Copy ID
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Ubah Status</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleStatusChange(reg.id, 'PENDING')}>
                        Pending
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(reg.id, 'INTERVIEW')}>
                        Interview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(reg.id, 'ACCEPTED')}>
                        Diterima
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(reg.id, 'WAITLIST')}>
                        Cadangan
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(reg.id, 'REJECTED')}>
                        Ditolak
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

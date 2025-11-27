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
import { MoreHorizontal, Trash2, CheckCircle, Play, XCircle } from 'lucide-react'
import { deleteAgenda, updateAgendaStatus } from '@/actions/agenda-actions'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

type Agenda = {
  id: string
  title: string
  description: string | null
  date: Date
  startTime: string | null
  endTime: string | null
  location: string | null
  type: string
  status: string
}

export function AgendaTable({ agendas }: { agendas: Agenda[] }) {
  async function handleDelete(id: string, title: string) {
    if (confirm(`Hapus agenda "${title}"?`)) {
      const result = await deleteAgenda(id)
      if (!result.success) {
        alert(result.error)
      }
    }
  }

  async function handleStatusChange(id: string, status: string) {
    const result = await updateAgendaStatus(id, status)
    if (!result.success) {
      alert(result.error)
    }
  }

  function getTypeBadge(type: string) {
    const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      RAPAT: { label: 'Rapat', variant: 'default' },
      ACARA: { label: 'Acara', variant: 'secondary' },
      DEADLINE: { label: 'Deadline', variant: 'destructive' },
      LAINNYA: { label: 'Lainnya', variant: 'outline' },
    }
    const config = variants[type] || { label: type, variant: 'outline' }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  function getStatusBadge(status: string) {
    const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
      PLANNED: { label: 'Direncanakan', variant: 'outline' },
      ONGOING: { label: 'Berlangsung', variant: 'default' },
      COMPLETED: { label: 'Selesai', variant: 'secondary' },
      CANCELLED: { label: 'Dibatalkan', variant: 'outline' },
    }
    const config = variants[status] || { label: status, variant: 'outline' }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead>Waktu</TableHead>
            <TableHead>Judul</TableHead>
            <TableHead>Jenis</TableHead>
            <TableHead>Lokasi</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agendas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                Belum ada agenda
              </TableCell>
            </TableRow>
          ) : (
            agendas.map((agenda) => (
              <TableRow key={agenda.id}>
                <TableCell>
                  {format(new Date(agenda.date), 'dd MMM yyyy', { locale: localeId })}
                </TableCell>
                <TableCell className="text-sm">
                  {agenda.startTime && agenda.endTime
                    ? `${agenda.startTime} - ${agenda.endTime}`
                    : '-'}
                </TableCell>
                <TableCell className="font-medium">{agenda.title}</TableCell>
                <TableCell>{getTypeBadge(agenda.type)}</TableCell>
                <TableCell>{agenda.location || '-'}</TableCell>
                <TableCell>{getStatusBadge(agenda.status)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {agenda.status === 'PLANNED' && (
                        <DropdownMenuItem onClick={() => handleStatusChange(agenda.id, 'ONGOING')}>
                          <Play className="mr-2 h-4 w-4" />
                          Mulai
                        </DropdownMenuItem>
                      )}
                      {agenda.status === 'ONGOING' && (
                        <DropdownMenuItem onClick={() => handleStatusChange(agenda.id, 'COMPLETED')}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Selesai
                        </DropdownMenuItem>
                      )}
                      {(agenda.status === 'PLANNED' || agenda.status === 'ONGOING') && (
                        <DropdownMenuItem onClick={() => handleStatusChange(agenda.id, 'CANCELLED')}>
                          <XCircle className="mr-2 h-4 w-4" />
                          Batalkan
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDelete(agenda.id, agenda.title)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Hapus
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



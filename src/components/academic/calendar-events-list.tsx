'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { deleteAcademicEvent } from "@/actions/academic-actions"
import { EditCalendarEventDialog } from "./edit-calendar-event-dialog"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

function getTypeBadge(type: string) {
  const badges: { [key: string]: { label: string; variant: "default" | "secondary" | "destructive" | "outline" } } = {
    HOLIDAY: { label: 'Libur', variant: 'secondary' },
    EXAM: { label: 'Ujian', variant: 'destructive' },
    EVENT: { label: 'Kegiatan', variant: 'default' },
  }
  const badge = badges[type] || { label: type, variant: 'outline' }
  return <Badge variant={badge.variant}>{badge.label}</Badge>
}

export function CalendarEventsList({ events, lembagaList, academicYears }: { events: any[], lembagaList: any[], academicYears: any[] }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Judul</TableHead>
            <TableHead>Tipe</TableHead>
            <TableHead>Tanggal Mulai</TableHead>
            <TableHead>Tanggal Selesai</TableHead>
            <TableHead>Lembaga</TableHead>
            <TableHead>Tahun Akademik</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => {
            // Determine lembaga display
            const totalLembaga = lembagaList.length
            const eventLembagaCount = event.eventLembagas?.length || 0
            
            let lembagaDisplay = 'Semua'
            if (eventLembagaCount > 0 && eventLembagaCount < totalLembaga) {
              // Show individual lembaga names
              const names = event.eventLembagas.map((el: any) => el.lembaga.name)
              if (names.length <= 2) {
                lembagaDisplay = names.join(', ')
              } else {
                lembagaDisplay = `${names.slice(0, 2).join(', ')}, +${names.length - 2} lainnya`
              }
            } else if (eventLembagaCount === 0 && event.lembaga) {
              // Backward compatibility - single lembaga
              lembagaDisplay = event.lembaga.name
            }
            
            return (
              <TableRow key={event.id}>
                <TableCell className="font-medium">{event.title}</TableCell>
                <TableCell>{getTypeBadge(event.type)}</TableCell>
                <TableCell>{new Date(event.startDate).toLocaleDateString('id-ID')}</TableCell>
                <TableCell>{new Date(event.endDate).toLocaleDateString('id-ID')}</TableCell>
                <TableCell>{lembagaDisplay}</TableCell>
                <TableCell>{event.academicYear || '-'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <EditCalendarEventDialog event={event} lembagaList={lembagaList} academicYears={academicYears} />
                    <ConfirmDialog
                      trigger={
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      }
                      title="Hapus Event"
                      description={`Yakin ingin menghapus event "${event.title}"? Tindakan ini tidak dapat dibatalkan.`}
                      onConfirm={async () => { await deleteAcademicEvent(event.id) }}
                      confirmText="Hapus"
                      cancelText="Batal"
                      variant="destructive"
                    />
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

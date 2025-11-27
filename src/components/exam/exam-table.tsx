'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Calendar, Clock, FileEdit, ClipboardEdit } from "lucide-react"
import { useState } from "react"
import { AddExamDialog } from "./add-exam-dialog"
import { deleteExam } from "@/actions/exam-actions"
import Link from "next/link"
import { format } from "date-fns"
import { id as idLocale } from "date-fns/locale"

export function ExamTable({
  mapelId,
  exams,
  lembagaId
}: {
  mapelId: string
  exams: any[]
  lembagaId: string
}) {
  const [showAddDialog, setShowAddDialog] = useState(false)

  async function handleDelete(id: string) {
    if (confirm('Yakin hapus ujian ini? Semua data nilai dan soal terkait akan dihapus.')) {
      const res = await deleteExam(id)
      if (res.success) {
        window.location.reload()
      }
    }
  }

  function getTypeLabel(type: string) {
    const labels: Record<string, string> = {
      'HARIAN': 'Ulangan Harian',
      'UTS': 'UTS',
      'UAS': 'UAS',
      'LISAN': 'Ujian Lisan',
      'PRAKTEK': 'Ujian Praktek',
      'HAFALAN': 'Ujian Hafalan'
    }
    return labels[type] || type
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Daftar Ujian ({exams.length})</CardTitle>
            <Button size="sm" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Buat Ujian
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {exams.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Belum ada ujian. Klik "Buat Ujian" untuk menambahkan.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Ujian</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Jadwal</TableHead>
                    <TableHead>Durasi</TableHead>
                    <TableHead>Soal</TableHead>
                    <TableHead>Nilai</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exams.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell className="font-medium">
                        {exam.name}
                        {exam.description && (
                          <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {exam.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getTypeLabel(exam.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Calendar className="h-3 w-3 mr-2 text-muted-foreground" />
                          {format(new Date(exam.date), 'dd MMMM yyyy, HH:mm', { locale: idLocale })}
                        </div>
                      </TableCell>
                      <TableCell>
                        {exam.duration ? (
                          <div className="flex items-center text-sm">
                            <Clock className="h-3 w-3 mr-2 text-muted-foreground" />
                            {exam.duration} menit
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {exam._count.questions} Soal
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            exam._count.nilais === 0 ? "outline" : 
                            exam._count.nilais < (exam.mapel?.kelas?.santris?.length || 0) ? "secondary" : 
                            "default"
                          }
                        >
                          {exam._count.nilais} Nilai
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/dashboard/academic/exams/${lembagaId}/${exam.id}/nilai`}>
                            <Button variant="ghost" size="icon" title="Input Nilai">
                              <ClipboardEdit className="h-4 w-4 text-green-500" />
                            </Button>
                          </Link>
                          <Link href={`/dashboard/academic/exams/${lembagaId}/${exam.id}`}>
                            <Button variant="ghost" size="icon" title="Kelola Soal">
                              <FileEdit className="h-4 w-4 text-blue-500" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(exam.id)}
                            title="Hapus Ujian"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AddExamDialog
        mapelId={mapelId}
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={() => window.location.reload()}
      />
    </>
  )
}

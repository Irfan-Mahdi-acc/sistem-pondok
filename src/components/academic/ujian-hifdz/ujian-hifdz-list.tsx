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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { deleteUjianHifdzRecord } from "@/actions/ujian-hifdz-actions"
import { useToast } from "@/components/ui/toast"
import { UjianHifdzForm } from "./ujian-hifdz-form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface UjianHifdzListProps {
  records: any[]
  santriList: any[]
  ustadzList: any[]
}

export function UjianHifdzList({ records, santriList, ustadzList }: UjianHifdzListProps) {
  const [editingRecord, setEditingRecord] = useState<any>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { showToast } = useToast()

  const handleDelete = async () => {
    if (!deletingId) return
    
    const result = await deleteUjianHifdzRecord(deletingId)
    if (result.success) {
      showToast("Data ujian berhasil dihapus", "success")
    } else {
      showToast("Gagal menghapus data", "error")
    }
    setDeletingId(null)
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
      case 'B': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
      case 'C': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
      case 'D': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Santri</TableHead>
              <TableHead>Materi Ujian</TableHead>
              <TableHead>Nilai</TableHead>
              <TableHead>Penguji</TableHead>
              <TableHead>Catatan</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                  Belum ada data ujian.
                </TableCell>
              </TableRow>
            ) : (
              records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    {format(new Date(record.date), "dd MMMM yyyy", { locale: id })}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{record.santri.nama}</div>
                    <div className="text-xs text-muted-foreground">
                      {record.santri.kelas?.name || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{record.surah}</div>
                    <div className="text-xs text-muted-foreground">
                      Ayat {record.ayatStart} - {record.ayatEnd}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getGradeColor(record.grade)}>
                      {record.grade}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {record.ustadz?.user?.name || '-'}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={record.note || ''}>
                    {record.note || '-'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setEditingRecord(record)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => setDeletingId(record.id)}
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

      <UjianHifdzForm
        santriList={santriList}
        ustadzList={ustadzList}
        record={editingRecord}
        open={!!editingRecord}
        onOpenChange={(open) => !open && setEditingRecord(null)}
      />

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Data ujian yang dihapus tidak dapat dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

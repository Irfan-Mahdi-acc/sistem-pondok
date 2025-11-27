'use client'

import { useState } from 'react'
import { updateSantri } from '@/actions/santri-actions'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { UserPlus, X } from 'lucide-react'

interface KelasStudentListProps {
  kelasId: string
  students: Array<{
    id: string
    nis: string
    nama: string
    gender: string
  }>
  availableStudents: Array<{
    id: string
    nis: string
    nama: string
    gender: string
  }>
}

export function KelasStudentList({
  kelasId,
  students,
  availableStudents,
}: KelasStudentListProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('')

  async function handleAddStudent() {
    if (!selectedStudentId) return

    const formData = new FormData()
    formData.append('kelasId', kelasId)

    await updateSantri(selectedStudentId, formData)
    setSelectedStudentId('')
  }

  async function handleRemoveStudent(studentId: string) {
    const formData = new FormData()
    formData.append('kelasId', '')

    await updateSantri(studentId, formData)
  }

  return (
    <div className="space-y-4">
      {/* Add Student */}
      <div className="flex gap-2">
        <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Pilih santri untuk ditambahkan" />
          </SelectTrigger>
          <SelectContent>
            {availableStudents
              .filter(s => !students.find(st => st.id === s.id))
              .map((student) => (
                <SelectItem key={student.id} value={student.id}>
                  {student.nis} - {student.nama}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <Button onClick={handleAddStudent} disabled={!selectedStudentId}>
          <UserPlus className="mr-2 h-4 w-4" />
          Tambah
        </Button>
      </div>

      {/* Student List */}
      {students.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Belum ada santri di kelas ini
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>NIS</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Jenis Kelamin</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.nis}</TableCell>
                <TableCell>{student.nama}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveStudent(student.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

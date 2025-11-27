'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Trash2, Edit } from "lucide-react"
import { AddJadwalDialog } from "./add-jadwal-dialog"
import { EditJadwalDialog } from "./edit-jadwal-dialog"
import { useState } from "react"
import { deleteJadwal } from "@/actions/jadwal-actions"

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

export default function JadwalSection({ 
  jadwals, 
  kelasList, 
  mapels, 
  jamPelajaran 
}: { 
  jadwals: any[]
  kelasList: any[]
  mapels: any[]
  jamPelajaran: any[]
}) {
  const [openAdd, setOpenAdd] = useState(false)
  const [editingJadwal, setEditingJadwal] = useState<any>(null)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Jadwal Kelas</CardTitle>
        <Button onClick={() => setOpenAdd(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Tambah Jadwal
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hari</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Jam</TableHead>
                <TableHead>Mata Pelajaran</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jadwals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Belum ada jadwal
                  </TableCell>
                </TableRow>
              ) : (
                jadwals.map((jadwal) => (
                  <TableRow key={jadwal.id}>
                    <TableCell>{jadwal.day}</TableCell>
                    <TableCell>{jadwal.kelas.name}</TableCell>
                    <TableCell>
                      {jadwal.jamPelajaran.name} ({jadwal.jamPelajaran.startTime} - {jadwal.jamPelajaran.endTime})
                    </TableCell>
                    <TableCell>
                      {jadwal.mapel?.name || <span className="text-muted-foreground">Istirahat</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setEditingJadwal(jadwal)}
                        >
                          <Edit className="h-4 w-4 text-blue-500" />
                        </Button>
                        <form action={async () => {
                          if (confirm('Yakin ingin menghapus jadwal ini?')) {
                            await deleteJadwal(jadwal.id)
                          }
                        }}>
                          <Button variant="ghost" size="icon" type="submit">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <AddJadwalDialog 
        open={openAdd} 
        onOpenChange={setOpenAdd} 
        kelasList={kelasList}
        mapels={mapels}
        jamPelajaran={jamPelajaran}
      />

      {editingJadwal && (
        <EditJadwalDialog 
          jadwal={editingJadwal}
          kelasList={kelasList}
          mapels={mapels}
          jamPelajaran={jamPelajaran}
          open={!!editingJadwal} 
          onOpenChange={(open) => !open && setEditingJadwal(null)} 
        />
      )}
    </Card>
  )
}

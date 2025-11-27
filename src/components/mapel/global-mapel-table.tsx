'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2, Edit, Calendar, GraduationCap } from "lucide-react"
import { deleteMapel } from "@/actions/mapel-actions"
import { EditMapelDialog } from "./edit-mapel-dialog"
import { ManageScheduleDialog } from "./manage-schedule-dialog"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function GlobalMapelTable({ 
  mapels, 
  lembagas,
  instructors,
  groupList = []
}: { 
  mapels: any[], 
  lembagas: any[],
  instructors: any[],
  groupList?: any[]
}) {
  const [editingMapel, setEditingMapel] = useState<any>(null)
  const [managingSchedule, setManagingSchedule] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [filterLembaga, setFilterLembaga] = useState<string>('all')

  const filteredMapels = mapels.filter(mapel => {
    const matchesSearch = mapel.name.toLowerCase().includes(search.toLowerCase()) ||
                         (mapel.code && mapel.code.toLowerCase().includes(search.toLowerCase()))
    const matchesLembaga = filterLembaga === 'all' || mapel.kelas.lembagaId === filterLembaga
    return matchesSearch && matchesLembaga
  })

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Cari mata pelajaran..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={filterLembaga} onValueChange={setFilterLembaga}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter Lembaga" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Lembaga</SelectItem>
            {lembagas.map((l) => (
              <SelectItem key={l.id} value={l.id}>
                {l.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Mapel</TableHead>
              <TableHead>Kode</TableHead>
              <TableHead>Lembaga</TableHead>
              <TableHead>Kelas</TableHead>
              <TableHead>Pengampu</TableHead>
              <TableHead>Jadwal</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMapels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Tidak ada data
                </TableCell>
              </TableRow>
            ) : (
              filteredMapels.map((mapel) => (
                <TableRow key={mapel.id}>
                  <TableCell className="font-medium">{mapel.name}</TableCell>
                  <TableCell>{mapel.code || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{mapel.kelas.lembaga.name}</Badge>
                  </TableCell>
                  <TableCell>{mapel.kelas.name}</TableCell>
                  <TableCell>{mapel.ustadz?.user.name || '-'}</TableCell>
                  <TableCell>
                    {mapel.jadwals && mapel.jadwals.length > 0 ? (
                      <Badge>{mapel.jadwals.length} jadwal</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setManagingSchedule(mapel)}
                        title="Kelola Jadwal"
                      >
                        <Calendar className="h-4 w-4 text-green-500" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setEditingMapel(mapel)}
                      >
                        <Edit className="h-4 w-4 text-blue-500" />
                      </Button>
                      <form action={async () => {
                        if (confirm('Yakin hapus mata pelajaran ini?')) {
                          await deleteMapel(mapel.id)
                        }
                      }}>
                        <Button variant="ghost" size="icon">
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

      {editingMapel && (
        <EditMapelDialog 
          mapel={editingMapel} 
          kelasList={lembagas.flatMap(l => l.kelas || [])}
          instructorList={instructors}
          open={!!editingMapel} 
          onOpenChange={(open) => !open && setEditingMapel(null)} 
        />
      )}

      {managingSchedule && (
        <ManageScheduleDialog
          mapel={managingSchedule}
          open={!!managingSchedule}
          onOpenChange={(open) => !open && setManagingSchedule(null)}
        />
      )}
    </div>
  )
}

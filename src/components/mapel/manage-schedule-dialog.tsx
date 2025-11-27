'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, Trash2, Clock } from "lucide-react"
import { useState, useEffect } from "react"
import { getJadwalByMapel, deleteJadwal, getJamPelajaranByLembaga, deleteJamPelajaran } from "@/actions/jadwal-actions"
import { AddJadwalForMapelDialog } from "./add-jadwal-for-mapel-dialog"
import { AddJamPelajaranDialog } from "./add-jam-pelajaran-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ManageScheduleDialog({ 
  mapel, 
  open, 
  onOpenChange 
}: { 
  mapel: any
  open: boolean
  onOpenChange: (open: boolean) => void 
}) {
  const [jadwals, setJadwals] = useState<any[]>([])
  const [jamPelajarans, setJamPelajarans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddJadwal, setShowAddJadwal] = useState(false)
  const [showAddJamPelajaran, setShowAddJamPelajaran] = useState(false)

  useEffect(() => {
    if (open && mapel) {
      loadData()
    }
  }, [open, mapel])

  async function loadData() {
    setLoading(true)
    const [jadwalData, jamData] = await Promise.all([
      getJadwalByMapel(mapel.id),
      getJamPelajaranByLembaga(mapel.kelas.lembagaId)
    ])
    setJadwals(jadwalData)
    setJamPelajarans(jamData)
    setLoading(false)
  }

  async function handleDeleteJadwal(jadwalId: string) {
    if (confirm('Yakin hapus jadwal ini?')) {
      const res = await deleteJadwal(jadwalId)
      if (res.success) {
        loadData()
      }
    }
  }

  async function handleDeleteJamPelajaran(jamId: string) {
    if (confirm('Yakin hapus jam pelajaran ini? Jadwal yang menggunakan jam ini akan terhapus!')) {
      const res = await deleteJamPelajaran(jamId)
      if (res.success) {
        loadData()
      }
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Kelola Jadwal: {mapel?.name}
              <div className="text-sm font-normal text-muted-foreground mt-1">
                {mapel?.kelas?.name} - {mapel?.kelas?.lembaga?.name}
              </div>
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="jadwal" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="jadwal">
                <Calendar className="h-4 w-4 mr-2" />
                Jadwal Pelajaran
              </TabsTrigger>
              <TabsTrigger value="jam">
                <Clock className="h-4 w-4 mr-2" />
                Jam Pelajaran
              </TabsTrigger>
            </TabsList>

            <TabsContent value="jadwal" className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {jadwals.length} jadwal terdaftar
                </div>
                <Button size="sm" onClick={() => setShowAddJadwal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Jadwal
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : jadwals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Belum ada jadwal. Klik "Tambah Jadwal" untuk menambahkan.
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Hari</TableHead>
                        <TableHead>Jam</TableHead>
                        <TableHead>Waktu</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jadwals.map((jadwal) => (
                        <TableRow key={jadwal.id}>
                          <TableCell>
                            <Badge variant="outline">{jadwal.day}</Badge>
                          </TableCell>
                          <TableCell>{jadwal.jamPelajaran.name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {jadwal.jamPelajaran.startTime} - {jadwal.jamPelajaran.endTime}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteJadwal(jadwal.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="jam" className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {jamPelajarans.length} jam pelajaran tersedia
                </div>
                <Button size="sm" onClick={() => setShowAddJamPelajaran(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Jam Pelajaran
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : jamPelajarans.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Belum ada jam pelajaran. Klik "Tambah Jam Pelajaran" untuk menambahkan.
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>Waktu</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jamPelajarans.map((jam) => (
                        <TableRow key={jam.id}>
                          <TableCell className="font-medium">{jam.name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {jam.startTime} - {jam.endTime}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteJamPelajaran(jam.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {showAddJadwal && (
        <AddJadwalForMapelDialog
          mapel={mapel}
          open={showAddJadwal}
          onOpenChange={setShowAddJadwal}
          onSuccess={loadData}
        />
      )}

      {showAddJamPelajaran && (
        <AddJamPelajaranDialog
          lembagaId={mapel.kelas.lembagaId}
          open={showAddJamPelajaran}
          onOpenChange={setShowAddJamPelajaran}
          onSuccess={loadData}
        />
      )}
    </>
  )
}

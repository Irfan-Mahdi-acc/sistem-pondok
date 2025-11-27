'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createJadwal } from "@/actions/jadwal-actions"

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

export function AddJadwalDialog({ 
  open, 
  onOpenChange, 
  kelasList,
  mapels,
  jamPelajaran
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void
  kelasList: any[]
  mapels: any[]
  jamPelajaran: any[]
}) {

  async function handleSubmit(formData: FormData) {
    const res = await createJadwal(formData)
    if (res.success) {
      onOpenChange(false)
    } else {
      alert('Gagal menambahkan jadwal')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Jadwal Pelajaran</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="day" className="text-right">
              Hari *
            </Label>
            <Select name="day" required>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Pilih Hari" />
              </SelectTrigger>
              <SelectContent>
                {DAYS.map((day) => (
                  <SelectItem key={day} value={day}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="kelasId" className="text-right">
              Kelas *
            </Label>
            <Select name="kelasId" required>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Pilih Kelas" />
              </SelectTrigger>
              <SelectContent>
                {kelasList.map((k) => (
                  <SelectItem key={k.id} value={k.id}>
                    {k.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="jamPelajaranId" className="text-right">
              Jam *
            </Label>
            <Select name="jamPelajaranId" required>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Pilih Jam" />
              </SelectTrigger>
              <SelectContent>
                {jamPelajaran.map((jam) => (
                  <SelectItem key={jam.id} value={jam.id}>
                    {jam.name} ({jam.startTime} - {jam.endTime})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="mapelId" className="text-right">
              Mapel
            </Label>
            <Select name="mapelId">
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Pilih Mapel (Opsional untuk Istirahat)" />
              </SelectTrigger>
              <SelectContent>
                {mapels.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name} ({m.kelas.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Simpan</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

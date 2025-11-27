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
import { getJamPelajaranByLembaga } from "@/actions/jadwal-actions"
import { useState, useEffect } from "react"

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

export function AddJadwalForMapelDialog({ 
  mapel, 
  open, 
  onOpenChange,
  onSuccess
}: { 
  mapel: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const [jamPelajaranList, setJamPelajaranList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (open && mapel) {
      loadJamPelajaran()
    }
  }, [open, mapel])

  async function loadJamPelajaran() {
    setLoading(true)
    const data = await getJamPelajaranByLembaga(mapel.kelas.lembagaId)
    setJamPelajaranList(data)
    setLoading(false)
  }

  async function handleSubmit(formData: FormData) {
    // Add kelasId and mapelId
    formData.append('kelasId', mapel.kelasId)
    formData.append('mapelId', mapel.id)

    const res = await createJadwal(formData)
    if (res.success) {
      onOpenChange(false)
      onSuccess()
    } else {
      alert('Gagal menambahkan jadwal')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Jadwal</DialogTitle>
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
            <Label htmlFor="jamPelajaranId" className="text-right">
              Jam *
            </Label>
            <Select name="jamPelajaranId" required disabled={loading}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder={loading ? "Loading..." : "Pilih Jam Pelajaran"} />
              </SelectTrigger>
              <SelectContent>
                {jamPelajaranList.map((jam) => (
                  <SelectItem key={jam.id} value={jam.id}>
                    {jam.name} ({jam.startTime} - {jam.endTime})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading || jamPelajaranList.length === 0}>
              Simpan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

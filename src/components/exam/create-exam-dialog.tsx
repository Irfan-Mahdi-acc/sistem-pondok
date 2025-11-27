"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { createExam } from "@/actions/exam-actions"
import { useRouter } from "next/navigation"

interface CreateExamDialogProps {
  kelasId: string
  mapels: Array<{ id: string; name: string }>
  academicYearId: string
  semester: string
}

export function CreateExamDialog({ kelasId, mapels, academicYearId, semester }: CreateExamDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.append('academicYearId', academicYearId)
    formData.append('semester', semester)

    const result = await createExam(formData)

    if (result && result.success) {
      setOpen(false)
      router.refresh()
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Buat Ujian Baru
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Buat Ujian Baru</DialogTitle>
            <DialogDescription>
              Buat ujian baru untuk semester {semester}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nama Ujian</Label>
              <Input
                id="name"
                name="name"
                placeholder="Contoh: UTS Matematika"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="mapelId">Mata Pelajaran</Label>
              <Select name="mapelId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Mapel" />
                </SelectTrigger>
                <SelectContent>
                  {mapels.map((mapel) => (
                    <SelectItem key={mapel.id} value={mapel.id}>
                      {mapel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Tipe Ujian</Label>
              <Select name="type" required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HARIAN">Harian</SelectItem>
                  <SelectItem value="UTS">UTS</SelectItem>
                  <SelectItem value="UAS">UAS</SelectItem>
                  <SelectItem value="LISAN">Lisan</SelectItem>
                  <SelectItem value="PRAKTEK">Praktek</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date">Tanggal</Label>
              <Input
                id="date"
                name="date"
                type="date"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="duration">Durasi (menit)</Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                placeholder="90"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Deskripsi ujian (opsional)"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Membuat..." : "Buat Ujian"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

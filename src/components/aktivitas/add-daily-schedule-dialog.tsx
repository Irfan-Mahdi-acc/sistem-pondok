'use client'

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus } from "lucide-react"
import { createDailySchedule } from "@/actions/daily-schedule-actions"
import { useRouter } from "next/navigation"

const DAYS = ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU", "AHAD"]

const SCHEDULE_TYPES = [
  { value: "IBADAH", label: "Ibadah", icon: "🕌" },
  { value: "BELAJAR", label: "Belajar", icon: "📖" },
  { value: "MAKAN", label: "Makan", icon: "🍽️" },
  { value: "ISTIRAHAT", label: "Istirahat", icon: "😴" },
  { value: "KEGIATAN", label: "Kegiatan", icon: "🎯" },
]

export function AddDailyScheduleDialog() {
  const [open, setOpen] = useState(false)
  const [selectedDays, setSelectedDays] = useState<string[]>(DAYS) // All days by default
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    )
  }

  const toggleAllDays = () => {
    setSelectedDays(prev => prev.length === DAYS.length ? [] : DAYS)
  }

  async function handleSubmit(formData: FormData) {
    setError(null)
    setLoading(true)

    // Add selected days as JSON string
    formData.set('days', JSON.stringify(selectedDays))
    formData.set('isActive', 'true')
    formData.set('order', '0')

    const res = await createDailySchedule(formData)

    if (res.success) {
      setOpen(false)
      setSelectedDays(DAYS)
      setError(null)
      router.refresh()
    } else {
      if (typeof res.error === 'string') {
        setError(res.error)
      } else if (res.error && typeof res.error === 'object') {
        const errorMessages = Object.entries(res.error.fieldErrors || {})
          .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
          .join('\n')
        setError(errorMessages || 'Terjadi kesalahan validasi')
      } else {
        setError('Gagal menambahkan jadwal')
      }
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Jadwal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Jadwal Harian</DialogTitle>
          <DialogDescription>
            Buat jadwal rutin untuk aktivitas harian pondok
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 rounded-lg p-3 text-sm text-red-800 dark:text-red-200">
            <p className="font-medium">Error:</p>
            <p className="whitespace-pre-line">{error}</p>
          </div>
        )}

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Kegiatan *</Label>
            <Input
              id="name"
              name="name"
              placeholder="contoh: Sholat Subuh"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipe Kegiatan *</Label>
            <Select name="type" required>
              <SelectTrigger>
                <SelectValue placeholder="Pilih tipe" />
              </SelectTrigger>
              <SelectContent>
                {SCHEDULE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Waktu Mulai *</Label>
              <Input
                id="startTime"
                name="startTime"
                type="time"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">Waktu Selesai *</Label>
              <Input
                id="endTime"
                name="endTime"
                type="time"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Hari *</Label>
            <div className="flex items-center gap-2 mb-2">
              <Checkbox
                id="allDays"
                checked={selectedDays.length === DAYS.length}
                onCheckedChange={toggleAllDays}
              />
              <label htmlFor="allDays" className="text-sm font-medium">
                Semua Hari
              </label>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {DAYS.map((day) => (
                <div key={day} className="flex items-center space-x-2">
                  <Checkbox
                    id={day}
                    checked={selectedDays.includes(day)}
                    onCheckedChange={() => toggleDay(day)}
                  />
                  <label
                    htmlFor={day}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {day.slice(0, 3)}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Lokasi</Label>
            <Input
              id="location"
              name="location"
              placeholder="contoh: Masjid"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Keterangan</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Keterangan tambahan (opsional)"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading || selectedDays.length === 0}>
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

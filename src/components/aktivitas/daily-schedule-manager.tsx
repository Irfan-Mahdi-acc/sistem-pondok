'use client'

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Trash2, MapPin, Clock } from "lucide-react"
import { deleteDailySchedule, toggleScheduleStatus } from "@/actions/daily-schedule-actions"
import { useRouter } from "next/navigation"
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

const SCHEDULE_TYPES: Record<string, { label: string; icon: string; color: string }> = {
  IBADAH: { label: "Ibadah", icon: "🕌", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  BELAJAR: { label: "Belajar", icon: "📖", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  MAKAN: { label: "Makan", icon: "🍽️", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
  ISTIRAHAT: { label: "Istirahat", icon: "😴", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
  KEGIATAN: { label: "Kegiatan", icon: "🎯", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
}

interface DailyScheduleManagerProps {
  schedules: any[]
}

export function DailyScheduleManager({ schedules }: DailyScheduleManagerProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!deleteId) return

    setLoading(true)
    const result = await deleteDailySchedule(deleteId)

    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || "Gagal menghapus jadwal")
    }

    setLoading(false)
    setDeleteId(null)
  }

  const handleToggleStatus = async (id: string) => {
    const result = await toggleScheduleStatus(id)

    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || "Gagal mengubah status")
    }
  }

  const parseDays = (daysJson: string) => {
    try {
      const days = JSON.parse(daysJson)
      if (days.length === 7) return "Setiap Hari"
      return days.map((d: string) => d.slice(0, 3)).join(", ")
    } catch {
      return daysJson
    }
  }

  if (schedules.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Belum ada jadwal harian</p>
        <p className="text-sm mt-2">Klik "Tambah Jadwal" untuk membuat jadwal baru</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-2">
        {schedules.map((schedule) => {
          const typeInfo = SCHEDULE_TYPES[schedule.type] || SCHEDULE_TYPES.KEGIATAN

          return (
            <Card
              key={schedule.id}
              className={`p-4 transition-opacity ${!schedule.isActive ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{typeInfo.icon}</span>
                    <div>
                      <h3 className="font-semibold">{schedule.name}</h3>
                      <Badge className={typeInfo.color} variant="secondary">
                        {typeInfo.label}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{schedule.startTime} - {schedule.endTime}</span>
                    </div>

                    {schedule.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{schedule.location}</span>
                      </div>
                    )}

                    <div>
                      <span className="font-medium">Hari:</span> {parseDays(schedule.days)}
                    </div>
                  </div>

                  {schedule.description && (
                    <p className="text-sm text-muted-foreground">{schedule.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {schedule.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                    <Switch
                      checked={schedule.isActive}
                      onCheckedChange={() => handleToggleStatus(schedule.id)}
                    />
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteId(schedule.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Jadwal?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Jadwal akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={loading}>
              {loading ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

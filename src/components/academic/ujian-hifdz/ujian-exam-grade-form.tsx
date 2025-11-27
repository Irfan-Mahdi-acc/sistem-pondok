'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { updateUjianHifdzRecord } from "@/actions/ujian-hifdz-actions"
import { getGradeSettings } from "@/actions/grade-setting-actions"
import { useToast } from "@/components/ui/toast"

interface UjianExamGradeFormProps {
  examId: string
  currentGrade: string | null
  currentNote: string | null
  lembagaId: string
}

interface GradeSetting {
  id: string
  gradeValue: number
  label: string
  description: string | null
}

export function UjianExamGradeForm({ 
  examId, 
  currentGrade, 
  currentNote,
  lembagaId
}: UjianExamGradeFormProps) {
  const [grade, setGrade] = useState(currentGrade || "")
  const [note, setNote] = useState(currentNote || "")
  const [isPending, setIsPending] = useState(false)
  const [gradeSettings, setGradeSettings] = useState<GradeSetting[]>([])
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()
  const router = useRouter()

  useEffect(() => {
    async function loadGradeSettings() {
      try {
        const result = await getGradeSettings(lembagaId)
        if (result.success && result.data) {
          setGradeSettings(result.data)
        }
      } catch (error) {
        console.error("Failed to load grade settings:", error)
      } finally {
        setLoading(false)
      }
    }

    loadGradeSettings()
  }, [lembagaId])

  async function handleSave() {
    if (!grade) {
      showToast("Pilih nilai terlebih dahulu", "error")
      return
    }

    setIsPending(true)

    try {
      const formData = new FormData()
      formData.append("grade", grade)
      if (note) formData.append("note", note)

      const result = await updateUjianHifdzRecord(examId, formData)

      if (result.success) {
        showToast("Nilai berhasil disimpan", "success")
        router.refresh()
      } else {
        showToast(result.error as string, "error")
      }
    } catch (error) {
      showToast("Terjadi kesalahan", "error")
    } finally {
      setIsPending(false)
    }
  }

  // Get label for selected grade
  const selectedGradeSetting = gradeSettings.find(
    s => s.gradeValue.toString() === grade
  )

  return (
    <div className="space-y-3 border-t pt-3">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nilai / Predikat</Label>
          {loading ? (
            <div className="h-10 bg-muted animate-pulse rounded-md" />
          ) : (
            <Select value={grade} onValueChange={setGrade}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Nilai" />
              </SelectTrigger>
              <SelectContent>
                {gradeSettings.map((setting) => (
                  <SelectItem 
                    key={setting.id} 
                    value={setting.gradeValue.toString()}
                  >
                    {setting.gradeValue} - {setting.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {selectedGradeSetting?.description && (
            <p className="text-xs text-muted-foreground">
              {selectedGradeSetting.description}
            </p>
          )}
        </div>
        <div className="flex items-end">
          <Button 
            onClick={handleSave} 
            disabled={isPending || !grade || loading}
            className="w-full"
          >
            {isPending ? "Menyimpan..." : "Simpan Nilai"}
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Catatan Penguji (Opsional)</Label>
        <Textarea 
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Catatan tentang kelancaran, tajwid, atau hal lain yang perlu dicatat..."
          rows={2}
        />
      </div>
    </div>
  )
}

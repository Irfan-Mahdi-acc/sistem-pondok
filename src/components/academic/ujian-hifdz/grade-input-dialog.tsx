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
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateUjianHifdzRecord } from "@/actions/ujian-hifdz-actions"
import { useRouter } from "next/navigation"
import { Pencil } from "lucide-react"

interface GradeInputDialogProps {
  ujian: any
}

export function GradeInputDialog({ ujian }: GradeInputDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [grade, setGrade] = useState(ujian.grade || '')
  const [note, setNote] = useState(ujian.note || '')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData()
    formData.append('grade', grade)
    formData.append('note', note)

    const result = await updateUjianHifdzRecord(ujian.id, formData)

    if (result.success) {
      setOpen(false)
      router.refresh()
    } else {
      alert(result.error || 'Gagal menyimpan nilai')
    }

    setIsLoading(false)
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <Pencil className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Input Nilai Ujian</DialogTitle>
              <DialogDescription>
                {ujian.surah} • Ayat {ujian.ayatStart > 0 ? `${ujian.ayatStart}-${ujian.ayatEnd}` : '-'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="grade">Nilai (1-10)</Label>
                <Input
                  id="grade"
                  type="number"
                  min="1"
                  max="10"
                  step="0.1"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="Masukkan nilai"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Keterangan (opsional)</Label>
                <Textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Catatan tambahan"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

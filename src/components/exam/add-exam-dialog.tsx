'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createExam } from "@/actions/exam-actions"
import { useState } from "react"

export function AddExamDialog({ 
  mapelId,
  open, 
  onOpenChange,
  onSuccess
}: { 
  mapelId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  async function handleSubmit(formData: FormData) {
    formData.append('mapelId', mapelId)
    
    const res = await createExam(formData)
    if (res.success) {
      onOpenChange(false)
      onSuccess()
    } else {
      const errorMessage = typeof res.error === 'object' 
        ? Object.values(res.error).flat().join(', ')
        : res.error || 'Unknown error'
      alert('Gagal membuat ujian: ' + errorMessage)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Buat Ujian Baru</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Ujian *</Label>
            <Input 
              id="name" 
              name="name" 
              required 
              placeholder="Contoh: UTS Semester 1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipe Ujian *</Label>
              <Select name="type" defaultValue="HARIAN">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HARIAN">Ulangan Harian</SelectItem>
                  <SelectItem value="UTS">UTS</SelectItem>
                  <SelectItem value="UAS">UAS</SelectItem>
                  <SelectItem value="LISAN">Ujian Lisan</SelectItem>
                  <SelectItem value="PRAKTEK">Ujian Praktek</SelectItem>
                  <SelectItem value="HAFALAN">Ujian Hafalan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Tanggal (Opsional)</Label>
              <Input 
                id="date" 
                name="date" 
                type="datetime-local"
              />
              <p className="text-xs text-muted-foreground">
                Kosongkan jika tidak ada tanggal spesifik
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Durasi (Menit)</Label>
            <Input 
              id="duration" 
              name="duration" 
              type="number"
              min="1"
              placeholder="Contoh: 90"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi (Opsional)</Label>
            <Textarea 
              id="description" 
              name="description" 
              placeholder="Catatan tambahan untuk ujian ini..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit">
              Buat Ujian
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

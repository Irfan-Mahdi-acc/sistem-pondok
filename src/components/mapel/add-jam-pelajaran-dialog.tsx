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
import { createJamPelajaran } from "@/actions/jadwal-actions"
import { useState } from "react"
import { Plus } from "lucide-react"

export function AddJamPelajaranDialog({ 
  lembagaId,
  open, 
  onOpenChange,
  onSuccess
}: { 
  lembagaId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  async function handleSubmit(formData: FormData) {
    formData.append('lembagaId', lembagaId)
    
    const res = await createJamPelajaran(formData)
    if (res.success) {
      onOpenChange(false)
      onSuccess()
    } else {
      alert('Gagal menambahkan jam pelajaran')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Jam Pelajaran</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nama *
            </Label>
            <Input 
              id="name" 
              name="name" 
              className="col-span-3" 
              required 
              placeholder="contoh: Jam 1"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startTime" className="text-right">
              Jam Mulai *
            </Label>
            <Input 
              id="startTime" 
              name="startTime" 
              type="time"
              className="col-span-3" 
              required 
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endTime" className="text-right">
              Jam Selesai *
            </Label>
            <Input 
              id="endTime" 
              name="endTime" 
              type="time"
              className="col-span-3" 
              required 
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit">
              Simpan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

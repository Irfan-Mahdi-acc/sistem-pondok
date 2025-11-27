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
import { updateJamPelajaran } from "@/actions/jadwal-actions"

export function EditJamPelajaranDialog({ 
  jamPelajaran, 
  open, 
  onOpenChange 
}: { 
  jamPelajaran: any
  open: boolean
  onOpenChange: (open: boolean) => void 
}) {

  async function handleSubmit(formData: FormData) {
    const res = await updateJamPelajaran(jamPelajaran.id, formData)
    if (res.success) {
      onOpenChange(false)
    } else {
      alert('Gagal mengupdate')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Jam Pelajaran</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-4 py-4">
          <input type="hidden" name="lembagaId" value={jamPelajaran.lembagaId} />
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nama *
            </Label>
            <Input id="name" name="name" defaultValue={jamPelajaran.name} className="col-span-3" required placeholder="contoh: Jam 1" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startTime" className="text-right">
              Jam Mulai *
            </Label>
            <Input id="startTime" name="startTime" type="time" defaultValue={jamPelajaran.startTime} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endTime" className="text-right">
              Jam Selesai *
            </Label>
            <Input id="endTime" name="endTime" type="time" defaultValue={jamPelajaran.endTime} className="col-span-3" required />
          </div>
          <div className="flex justify-end">
            <Button type="submit">Simpan Perubahan</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

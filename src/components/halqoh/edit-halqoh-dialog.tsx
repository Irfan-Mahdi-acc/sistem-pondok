'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { updateHalqoh } from "@/actions/halqoh-actions"
import { useState } from "react"
import { Pencil } from "lucide-react"

export function EditHalqohDialog({ halqoh, instructorList }: { halqoh: any, instructorList: any[] }) {
  const [open, setOpen] = useState(false)

  async function handleSubmit(formData: FormData) {
    const res = await updateHalqoh(halqoh.id, formData)
    if (res.success) {
      setOpen(false)
    } else {
      alert('Failed to update halqoh')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Halqoh</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nama *
            </Label>
            <Input id="name" name="name" required className="col-span-3" defaultValue={halqoh.name} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Deskripsi
            </Label>
            <Input id="description" name="description" className="col-span-3" defaultValue={halqoh.description || ''} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ustadzId" className="text-right">
              Pembimbing
            </Label>
            <Select name="ustadzId" defaultValue={halqoh.ustadzId || ''}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Pilih Pembimbing" />
              </SelectTrigger>
              <SelectContent>
                {instructorList.map((instructor) => (
                  <SelectItem key={instructor.id} value={instructor.id}>
                    {instructor.user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="level" className="text-right">
              Level
            </Label>
            <Select name="level" defaultValue={halqoh.level || ''}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Pilih Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Pemula</SelectItem>
                <SelectItem value="Intermediate">Menengah</SelectItem>
                <SelectItem value="Advanced">Lanjutan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="schedule" className="text-right">
              Jadwal
            </Label>
            <Input id="schedule" name="schedule" className="col-span-3" defaultValue={halqoh.schedule || ''} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="maxCapacity" className="text-right">
              Kapasitas Maks
            </Label>
            <Input id="maxCapacity" name="maxCapacity" type="number" className="col-span-3" defaultValue={halqoh.maxCapacity || ''} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select name="status" defaultValue={halqoh.status}>
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Aktif</SelectItem>
                <SelectItem value="INACTIVE">Tidak Aktif</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Perbarui Halqoh</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

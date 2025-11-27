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

export function AddJamPelajaranDialog({ 
  open, 
  onOpenChange, 
  lembagaId,
  nextOrder 
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void
  lembagaId: string
  nextOrder: number
}) {

  async function handleSubmit(formData: FormData) {
    const res = await createJamPelajaran(formData)
    if (res.success) {
      onOpenChange(false)
    } else {
      alert('Failed to create')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Lesson Hour</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-4 py-4">
          <input type="hidden" name="lembagaId" value={lembagaId} />
          <input type="hidden" name="order" value={nextOrder} />
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" name="name" className="col-span-3" required placeholder="e.g. Jam Ke-1" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startTime" className="text-right">
              Start Time
            </Label>
            <Input id="startTime" name="startTime" type="time" className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endTime" className="text-right">
              End Time
            </Label>
            <Input id="endTime" name="endTime" type="time" className="col-span-3" required />
          </div>
          <div className="flex justify-end">
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

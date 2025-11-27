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
import { createHalqoh } from "@/actions/halqoh-actions"
import { useState } from "react"
import { Plus } from "lucide-react"

export function AddHalqohDialog({ instructorList }: { instructorList: any[] }) {
  const [open, setOpen] = useState(false)

  async function handleSubmit(formData: FormData) {
    const res = await createHalqoh(formData)
    if (res.success) {
      setOpen(false)
    } else {
      alert('Failed to create halqoh')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-1" />
          Add Halqoh
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Halqoh</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name *
            </Label>
            <Input id="name" name="name" required className="col-span-3" placeholder="e.g. Halqoh A" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input id="description" name="description" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ustadzId" className="text-right">
              Pembimbing
            </Label>
            <Select name="ustadzId">
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
            <Select name="level">
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="schedule" className="text-right">
              Schedule
            </Label>
            <Input id="schedule" name="schedule" className="col-span-3" placeholder="e.g. Senin-Rabu 07:00-08:00" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="maxCapacity" className="text-right">
              Max Capacity
            </Label>
            <Input id="maxCapacity" name="maxCapacity" type="number" className="col-span-3" />
          </div>
          <div className="flex justify-end">
            <Button type="submit">Create Halqoh</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

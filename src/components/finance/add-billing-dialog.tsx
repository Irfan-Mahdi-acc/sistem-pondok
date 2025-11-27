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
import { createBilling } from "@/actions/billing-actions"
import { getSantriList } from "@/actions/santri-actions"
import { useState, useEffect } from "react"
import { Plus } from "lucide-react"

export function AddBillingDialog({ categories }: { categories: any[] }) {
  const [open, setOpen] = useState(false)
  const [santriList, setSantriList] = useState<any[]>([])

  useEffect(() => {
    getSantriList().then(setSantriList)
  }, [])

  async function handleSubmit(formData: FormData) {
    const res = await createBilling(formData)
    if (res.success) {
      setOpen(false)
    } else {
      alert('Failed to create billing')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-1" />
          Add Billing
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Billing</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="santriId" className="text-right">
              Student *
            </Label>
            <Select name="santriId" required>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select Student" />
              </SelectTrigger>
              <SelectContent>
                {santriList.map((santri) => (
                  <SelectItem key={santri.id} value={santri.id}>
                    {santri.nama} - {santri.kelas?.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="categoryId" className="text-right">
              Category *
            </Label>
            <Select name="categoryId" required>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount *
            </Label>
            <Input id="amount" name="amount" type="number" required className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dueDate" className="text-right">
              Due Date *
            </Label>
            <Input id="dueDate" name="dueDate" type="date" required className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="academicYear" className="text-right">
              Academic Year
            </Label>
            <Input id="academicYear" name="academicYear" placeholder="e.g., 2024/2025" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="month" className="text-right">
              Month
            </Label>
            <Input id="month" name="month" type="month" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input id="description" name="description" className="col-span-3" />
          </div>
          <div className="flex justify-end">
            <Button type="submit">Create Billing</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

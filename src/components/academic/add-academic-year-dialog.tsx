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
import { createAcademicYear } from "@/actions/academic-year-actions"
import { useState } from "react"
import { Plus } from "lucide-react"

export function AddAcademicYearDialog({ lembagaList }: { lembagaList: any[] }) {
  const [open, setOpen] = useState(false)

  async function handleSubmit(formData: FormData) {
    const res = await createAcademicYear(formData)
    if (res.success) {
      setOpen(false)
    } else {
      alert('Failed to create academic year')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-1" />
          Tambah Tahun Akademik
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tambah Tahun Akademik</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nama *
            </Label>
            <Input 
              id="name" 
              name="name" 
              required 
              className="col-span-3" 
              placeholder="contoh: 2024/2025 atau 2024"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startDate" className="text-right">
              Tanggal Mulai *
            </Label>
            <Input id="startDate" name="startDate" type="date" required className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endDate" className="text-right">
              Tanggal Selesai *
            </Label>
            <Input id="endDate" name="endDate" type="date" required className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lembagaId" className="text-right">
              Lembaga
            </Label>
            <Select name="lembagaId">
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Semua Lembaga" />
              </SelectTrigger>
              <SelectContent>
                {lembagaList.map((lembaga) => (
                  <SelectItem key={lembaga.id} value={lembaga.id}>
                    {lembaga.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Buat Tahun Akademik</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

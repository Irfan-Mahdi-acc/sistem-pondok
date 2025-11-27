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
import { updateAcademicEvent } from "@/actions/academic-actions"
import { useState } from "react"
import { Pencil } from "lucide-react"
import { MultiLembagaSelector } from "@/components/ui/multi-lembaga-selector"
import { showSuccess, showError } from "@/lib/toast-helpers"

export function EditCalendarEventDialog({ event, lembagaList, academicYears }: { event: any, lembagaList: any[], academicYears: any[] }) {
  const [open, setOpen] = useState(false)
  const [selectedLembaga, setSelectedLembaga] = useState<string[]>(
    event.eventLembagas?.map((el: any) => el.lembagaId) || []
  )

  async function handleSubmit(formData: FormData) {
    const res = await updateAcademicEvent(event.id, formData)
    if (res.success) {
      setOpen(false)
      window.location.reload()
    } else {
      alert('Gagal mengupdate event')
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
          <DialogTitle>Edit Event Akademik</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Judul *
            </Label>
            <Input id="title" name="title" required className="col-span-3" defaultValue={event.title} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Tipe *
            </Label>
            <Select name="type" required defaultValue={event.type}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Pilih Tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HOLIDAY">Libur</SelectItem>
                <SelectItem value="EXAM">Ujian</SelectItem>
                <SelectItem value="EVENT">Kegiatan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startDate" className="text-right">
              Tanggal Mulai *
            </Label>
            <Input 
              id="startDate" 
              name="startDate" 
              type="date" 
              required 
              className="col-span-3" 
              defaultValue={new Date(event.startDate).toISOString().split('T')[0]}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endDate" className="text-right">
              Tanggal Selesai *
            </Label>
            <Input 
              id="endDate" 
              name="endDate" 
              type="date" 
              required 
              className="col-span-3" 
              defaultValue={new Date(event.endDate).toISOString().split('T')[0]}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="academicYear" className="text-right">
              Tahun Akademik *
            </Label>
            <Select name="academicYear" required defaultValue={event.academicYear || ''}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Pilih Tahun Akademik" />
              </SelectTrigger>
              <SelectContent>
                {academicYears.map((year) => (
                  <SelectItem key={year.id} value={year.name} className="max-w-md">
                    <span className="truncate block" title={`${year.name} ${year.isActive ? '(Active)' : ''}`}>
                      {year.name} {year.isActive && '(Active)'}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Lembaga *</Label>
            <div className="col-span-3">
              <MultiLembagaSelector 
                lembagaList={lembagaList}
                selectedIds={selectedLembaga}
                onChange={setSelectedLembaga}
              />
              {/* Hidden inputs for form submission */}
              {selectedLembaga.map(id => (
                <input key={id} type="hidden" name="lembagaIds" value={id} />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Deskripsi
            </Label>
            <Input id="description" name="description" className="col-span-3" defaultValue={event.description || ''} />
          </div>
          <div className="flex justify-end">
            <Button type="submit">Update Event</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

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
import { createTahfidzRecord } from "@/actions/tahfidz-actions"
import { useState, useEffect } from "react"
import { Plus } from "lucide-react"

export function AddTahfidzDialog({ halqohList }: { halqohList: any[] }) {
  const [open, setOpen] = useState(false)
  const [selectedHalqoh, setSelectedHalqoh] = useState<string>('')
  const [santriList, setSantriList] = useState<any[]>([])

  useEffect(() => {
    if (selectedHalqoh) {
      const halqoh = halqohList.find(h => h.id === selectedHalqoh)
      setSantriList(halqoh?.santris || [])
    } else {
      setSantriList([])
    }
  }, [selectedHalqoh, halqohList])

  async function handleSubmit(formData: FormData) {
    const res = await createTahfidzRecord(formData)
    if (res.success) {
      setOpen(false)
      setSelectedHalqoh('')
    } else {
      alert('Failed to create record')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-1" />
          Add Record
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Tahfidz Record</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">
              Halqoh *
            </Label>
            <Select value={selectedHalqoh} onValueChange={setSelectedHalqoh} required>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select Halqoh" />
              </SelectTrigger>
              <SelectContent>
                {halqohList.map((halqoh) => (
                  <SelectItem key={halqoh.id} value={halqoh.id}>
                    {halqoh.name} ({halqoh.santris.length} students)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="santriId" className="text-right">
              Student *
            </Label>
            <Select name="santriId" required disabled={!selectedHalqoh}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select Student" />
              </SelectTrigger>
              <SelectContent>
                {santriList.map((santri) => (
                  <SelectItem key={santri.id} value={santri.id}>
                    {santri.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type *
            </Label>
            <Select name="type" required>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SETORAN">Setoran (New)</SelectItem>
                <SelectItem value="MUROJAAH">Murojaah (Review)</SelectItem>
                <SelectItem value="TASMI">Tasmi (Listening)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="surah" className="text-right">
              Surah *
            </Label>
            <Input id="surah" name="surah" required className="col-span-3" placeholder="e.g. Al-Baqarah" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ayatStart" className="text-right">
              Ayat Start *
            </Label>
            <Input id="ayatStart" name="ayatStart" type="number" required className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ayatEnd" className="text-right">
              Ayat End *
            </Label>
            <Input id="ayatEnd" name="ayatEnd" type="number" required className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="grade" className="text-right">
              Grade
            </Label>
            <Select name="grade">
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">A (Excellent)</SelectItem>
                <SelectItem value="B">B (Good)</SelectItem>
                <SelectItem value="C">C (Fair)</SelectItem>
                <SelectItem value="D">D (Needs Improvement)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="note" className="text-right">
              Note
            </Label>
            <Input id="note" name="note" className="col-span-3" />
          </div>
          <div className="flex justify-end">
            <Button type="submit">Create Record</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

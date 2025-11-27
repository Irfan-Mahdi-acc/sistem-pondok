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
import { createMapel } from "@/actions/mapel-actions"
import { useState } from "react"

export function AddMapelDialog({ kelasList, instructorList, groupList = [] }: { 
  kelasList: any[], 
  instructorList: any[],
  groupList?: any[]
}) {
  const [open, setOpen] = useState(false)

  async function handleSubmit(formData: FormData) {
    const res = await createMapel(formData)
    if (res.success) {
      setOpen(false)
    } else {
      alert('Gagal menambahkan')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Tambah Mapel</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Mapel Baru</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nama *
            </Label>
            <Input id="name" name="name" className="col-span-3" required placeholder="contoh: Matematika" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="code" className="text-right">
              Kode
            </Label>
            <Input id="code" name="code" className="col-span-3" placeholder="contoh: MTK" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="kelasId" className="text-right">
              Kelas *
            </Label>
            <Select name="kelasId" required>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Pilih Kelas" />
              </SelectTrigger>
              <SelectContent>
                {kelasList.map((k) => (
                  <SelectItem key={k.id} value={k.id}>
                    {k.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {groupList.length > 0 && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="groupId" className="text-right">
                Group
              </Label>
              <Select name="groupId">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pilih Group (Opsional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tanpa Group</SelectItem>
                  {groupList.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name} ({group.lembaga?.name || 'Unknown'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ustadzId" className="text-right">
              Pengampu
            </Label>
            <Select name="ustadzId">
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Pilih Pengampu (Opsional)" />
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
          <div className="flex justify-end">
            <Button type="submit">Simpan</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateMapel } from "@/actions/mapel-actions"

export function EditMapelDialog({ 
  mapel, 
  kelasList,
  instructorList,
  open, 
  onOpenChange 
}: { 
  mapel: any
  kelasList: any[]
  instructorList: any[]
  open: boolean
  onOpenChange: (open: boolean) => void 
}) {

  async function handleSubmit(formData: FormData) {
    const res = await updateMapel(mapel.id, formData)
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
          <DialogTitle>Edit Mapel</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nama *
            </Label>
            <Input id="name" name="name" defaultValue={mapel.name} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="code" className="text-right">
              Kode
            </Label>
            <Input id="code" name="code" defaultValue={mapel.code} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="kelasId" className="text-right">
              Kelas *
            </Label>
            <Select name="kelasId" defaultValue={mapel.kelasId} required>
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ustadzId" className="text-right">
              Pengampu
            </Label>
            <Select name="ustadzId" defaultValue={mapel.ustadzId || undefined}>
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
            <Button type="submit">Simpan Perubahan</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

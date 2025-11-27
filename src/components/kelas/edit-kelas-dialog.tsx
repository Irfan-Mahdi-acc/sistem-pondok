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
import { updateKelas } from "@/actions/kelas-actions"

import { useState, useEffect } from "react"

export function EditKelasDialog({ 
  kelas, 
  lembagas,
  kelasList,
  open, 
  onOpenChange 
}: { 
  kelas: any
  lembagas: any[]
  kelasList: any[]
  open: boolean
  onOpenChange: (open: boolean) => void 
}) {
  const [selectedNextLembagaId, setSelectedNextLembagaId] = useState<string>('')

  useEffect(() => {
    if (open && kelas) {
      if (kelas.nextKelasId) {
        const nextKelas = kelasList.find((k: any) => k.id === kelas.nextKelasId)
        if (nextKelas) {
          setSelectedNextLembagaId(nextKelas.lembagaId)
        }
      } else {
        setSelectedNextLembagaId('')
      }
    }
  }, [open, kelas, kelasList])

  async function handleSubmit(formData: FormData) {
    const res = await updateKelas(kelas.id, formData)
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
          <DialogTitle>Edit Kelas</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nama *
            </Label>
            <Input id="name" name="name" defaultValue={kelas.name} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lembagaId" className="text-right">
              Lembaga *
            </Label>
            <Select name="lembagaId" defaultValue={kelas.lembagaId} required disabled>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Pilih Lembaga" />
              </SelectTrigger>
              <SelectContent>
                {lembagas.map((l) => (
                  <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="lembagaId" value={kelas.lembagaId} />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nextLembagaId" className="text-right">
              Lembaga Lanjutan
            </Label>
            <Select 
              value={selectedNextLembagaId} 
              onValueChange={setSelectedNextLembagaId}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Pilih Lembaga (Opsional)" />
              </SelectTrigger>
              <SelectContent>
                {lembagas.map((l) => (
                  <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nextKelasId" className="text-right">
              Kelas Selanjutnya
            </Label>
            <Select 
              name="nextKelasId" 
              defaultValue={kelas.nextKelasId || undefined}
              disabled={!selectedNextLembagaId}
              key={selectedNextLembagaId} // Reset when lembaga changes
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder={selectedNextLembagaId ? "Pilih Kelas Selanjutnya (Opsional)" : "Pilih Lembaga Terlebih Dahulu"} />
              </SelectTrigger>
              <SelectContent>
                {kelasList
                  .filter(k => k.lembagaId === selectedNextLembagaId)
                  .map((k) => (
                    // Don't allow selecting self as next class
                    k.id !== kelas.id && (
                      <SelectItem key={k.id} value={k.id}>
                        {k.name}
                      </SelectItem>
                    )
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

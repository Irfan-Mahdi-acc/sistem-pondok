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
import { createKelas } from "@/actions/kelas-actions"
import { useState } from "react"

export function AddKelasDialog({ lembagas, kelasList, defaultLembagaId }: { lembagas: any[], kelasList: any[], defaultLembagaId?: string }) {
  const [open, setOpen] = useState(false)
  const [selectedNextLembagaId, setSelectedNextLembagaId] = useState<string>('')

  async function handleSubmit(formData: FormData) {
    const res = await createKelas(formData)
    if (res.success) {
      setOpen(false)
    } else {
      alert('Failed to create')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Tambah Kelas</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Kelas Baru</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nama *
            </Label>
            <Input id="name" name="name" className="col-span-3" required placeholder="contoh: 7A, 1 Ula" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lembagaId" className="text-right">
              Lembaga *
            </Label>
            <Select name="lembagaId" required defaultValue={defaultLembagaId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Pilih Lembaga" />
              </SelectTrigger>
              <SelectContent>
                {lembagas.map((l) => (
                  <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Select name="nextKelasId" disabled={!selectedNextLembagaId} key={selectedNextLembagaId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder={selectedNextLembagaId ? "Pilih Kelas Selanjutnya" : "Pilih Lembaga Terlebih Dahulu"} />
              </SelectTrigger>
              <SelectContent>
                {kelasList
                  .filter(k => k.lembagaId === selectedNextLembagaId)
                  .map((k) => (
                    <SelectItem key={k.id} value={k.id}>
                      {k.name}
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

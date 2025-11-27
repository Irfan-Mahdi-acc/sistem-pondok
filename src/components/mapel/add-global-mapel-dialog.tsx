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
import { getKelasList } from "@/actions/kelas-actions"
import { useState, useEffect } from "react"
import { Plus } from "lucide-react"

export function AddGlobalMapelDialog({ lembagas, instructors, groupList = [] }: { 
  lembagas: any[], 
  instructors: any[],
  groupList?: any[]
}) {
  const [open, setOpen] = useState(false)
  const [selectedLembaga, setSelectedLembaga] = useState<string>('')
  const [kelasList, setKelasList] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch kelas when lembaga is selected
  useEffect(() => {
    if (selectedLembaga) {
      setLoading(true)
      getKelasList().then(allKelas => {
        const filtered = allKelas.filter(k => k.lembagaId === selectedLembaga)
        setKelasList(filtered)
        setLoading(false)
      })
    } else {
      setKelasList([])
    }
  }, [selectedLembaga])

  async function handleSubmit(formData: FormData) {
    setError(null)
    const res = await createMapel(formData)
    if (res.success) {
      setOpen(false)
      setSelectedLembaga('')
      setError(null)
    } else {
      // Display detailed error message
      if (typeof res.error === 'string') {
        setError(res.error)
      } else if (res.error && typeof res.error === 'object') {
        // Handle Zod validation errors
        const errorMessages = Object.entries(res.error.fieldErrors || {})
          .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
          .join('\n')
        setError(errorMessages || 'Terjadi kesalahan validasi')
      } else {
        setError('Gagal menambahkan mata pelajaran')
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Mata Pelajaran
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tambah Mata Pelajaran Baru</DialogTitle>
        </DialogHeader>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 rounded-lg p-3 text-sm text-red-800 dark:text-red-200">
            <p className="font-medium">Error:</p>
            <p className="whitespace-pre-line">{error}</p>
          </div>
        )}
        
        <form action={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lembaga" className="text-right">
              Lembaga *
            </Label>
            <Select value={selectedLembaga} onValueChange={setSelectedLembaga} required>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Pilih Lembaga" />
              </SelectTrigger>
              <SelectContent>
                {lembagas.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
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
            <Select name="kelasId" required disabled={!selectedLembaga || loading}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder={loading ? "Loading..." : "Pilih Kelas"} />
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
                {instructors.map((instructor) => (
                  <SelectItem key={instructor.id} value={instructor.id}>
                    {instructor.user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end">
            <Button type="submit" disabled={!selectedLembaga || kelasList.length === 0}>
              Simpan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

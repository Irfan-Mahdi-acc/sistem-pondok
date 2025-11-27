'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { addSantriToAsrama, removeSantriFromAsrama } from "@/actions/asrama-actions"
import { Plus, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function AsramaSantriList({ 
  asramaId,
  santriList,
  availableSantri 
}: { 
  asramaId: string
  santriList: any[]
  availableSantri: any[]
}) {
  const [open, setOpen] = useState(false)
  const [selectedSantri, setSelectedSantri] = useState<string>('')

  async function handleAdd() {
    if (!selectedSantri) return
    
    const res = await addSantriToAsrama(selectedSantri, asramaId)
    if (res.success) {
      setOpen(false)
      setSelectedSantri('')
    } else {
      alert('Gagal menambahkan santri')
    }
  }

  async function handleRemove(santriId: string) {
    if (confirm('Yakin ingin mengeluarkan santri dari asrama?')) {
      await removeSantriFromAsrama(santriId)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Total: {santriList.length} santri
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Tambah Santri
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Santri ke Asrama</DialogTitle>
              <DialogDescription>
                Pilih santri yang belum memiliki asrama
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Pilih Santri</Label>
                <Select value={selectedSantri} onValueChange={setSelectedSantri}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih santri" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSantri.map((santri) => (
                      <SelectItem key={santri.id} value={santri.id}>
                        {santri.nama} - {santri.nis} ({santri.lembaga.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAdd} className="w-full">
                Tambahkan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>NIS</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Lembaga</TableHead>
              <TableHead>Kelas</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {santriList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Belum ada santri di asrama ini
                </TableCell>
              </TableRow>
            ) : (
              santriList.map((santri) => (
                <TableRow key={santri.id}>
                  <TableCell className="font-medium">{santri.nis}</TableCell>
                  <TableCell>{santri.nama}</TableCell>
                  <TableCell>{santri.lembaga.name}</TableCell>
                  <TableCell>{santri.kelas?.name || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleRemove(santri.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

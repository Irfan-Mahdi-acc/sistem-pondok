'use client'

import { useState } from 'react'
import { createDocument } from '@/actions/surat-actions'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select'
import { Plus, Info } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DOCUMENT_CATEGORIES, getDocumentTypeInfo } from '@/lib/document-types'
import { ScrollArea } from '@/components/ui/scroll-area'

type Lembaga = {
  id: string
  name: string
  jenjang: string | null
}

export function AddDocumentDialog({ lembagas }: { lembagas: Lembaga[] }) {
  const [open, setOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [selectedLembaga, setSelectedLembaga] = useState<string>('')

  async function handleSubmit(formData: FormData) {
    const result = await createDocument(formData)
    if (result.success) {
      alert(`Dokumen berhasil ditambahkan!\nNomor Surat: ${result.number}`)
      setOpen(false)
      setSelectedType('')
      setSelectedDate(new Date().toISOString().split('T')[0])
      setSelectedLembaga('')
    } else {
      alert(result.error || 'Gagal menambah dokumen')
    }
  }

  // Generate preview nomor surat
  function getNumberPreview(): string {
    if (!selectedType || !selectedDate) return 'Pilih jenis dan tanggal terlebih dahulu'
    
    const date = new Date(selectedDate)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const monthRoman = [
      'I', 'II', 'III', 'IV', 'V', 'VI',
      'VII', 'VIII', 'IX', 'X', 'XI', 'XII'
    ][month - 1]

    const typeInfo = getDocumentTypeInfo(selectedType)
    const code = typeInfo.code
    
    let lembagaCode = ''
    // selectedLembaga will be empty string for PONDOK
    if (selectedLembaga && selectedLembaga !== '') {
      const lembaga = lembagas.find(l => l.id === selectedLembaga)
      if (lembaga) {
        lembagaCode = lembaga.jenjang || 
          lembaga.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 4)
      }
    }
    
    if (lembagaCode) {
      return `XXX/${code}/${lembagaCode}/${monthRoman}/${year}`
    } else {
      return `XXX/${code}/${monthRoman}/${year}`
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Dokumen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Tambah Dokumen Baru</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <form action={handleSubmit} className="space-y-6">
            {/* Section 1: Informasi Dasar */}
            <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
              <h3 className="font-semibold text-sm text-primary">📋 Informasi Dasar</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Lingkup Surat */}
                <div className="space-y-2">
                  <Label htmlFor="lembagaId" className="flex items-center gap-1">
                    Lingkup Surat <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={selectedLembaga || 'PONDOK'} 
                    onValueChange={(value) => setSelectedLembaga(value === 'PONDOK' ? '' : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih lingkup" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PONDOK">🏛️ Pondok (Umum)</SelectItem>
                      {lembagas.map((lembaga) => (
                        <SelectItem key={lembaga.id} value={lembaga.id}>
                          🏫 {lembaga.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <input type="hidden" name="lembagaId" value={selectedLembaga} />
                </div>

                {/* Tanggal */}
                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center gap-1">
                    Tanggal <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Jenis Dokumen - Full Width */}
              <div className="space-y-2">
                <Label htmlFor="type" className="flex items-center gap-1">
                  Jenis Dokumen <span className="text-red-500">*</span>
                </Label>
                <Select 
                  name="type" 
                  required 
                  value={selectedType} 
                  onValueChange={setSelectedType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis dokumen" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-[350px]">
                      {Object.entries(DOCUMENT_CATEGORIES).map(([category, types]) => (
                        <SelectGroup key={category}>
                          <SelectLabel className="font-bold text-primary sticky top-0 bg-background">
                            {category}
                          </SelectLabel>
                          {types.map((type) => {
                            const info = getDocumentTypeInfo(type)
                            return (
                              <SelectItem key={type} value={type}>
                                <div className="flex items-center justify-between w-full">
                                  <span className="font-medium">{info.label}</span>
                                  <span className="text-xs text-muted-foreground ml-2">
                                    ({info.code})
                                  </span>
                                </div>
                              </SelectItem>
                            )
                          })}
                        </SelectGroup>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Preview Nomor Surat - Simple */}
            <div className="space-y-2">
              <Label>Nomor</Label>
              <div className="rounded-md border bg-muted px-3 py-2">
                <p className="font-mono text-sm text-muted-foreground">
                  {getNumberPreview()}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Nomor akan digenerate otomatis saat disimpan
              </p>
            </div>

            {/* Section 2: Detail Dokumen */}
            <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
              <h3 className="font-semibold text-sm text-primary">📝 Detail Dokumen</h3>
              
              <div className="space-y-2">
                <Label htmlFor="title" className="flex items-center gap-1">
                  Perihal/Judul Dokumen <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="title" 
                  name="title" 
                  placeholder="Contoh: Pengangkatan Guru Tahun 2024"
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Catatan/Keterangan</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Tambahkan catatan atau keterangan tambahan jika diperlukan..."
                  rows={3}
                />
              </div>
            </div>

            {/* Section 3: File Dokumen (Optional) */}
            <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
              <h3 className="font-semibold text-sm text-primary">📎 File Dokumen (Opsional)</h3>
              
              <div className="space-y-2">
                <Label htmlFor="fileUrl" className="flex items-center gap-1">
                  URL/Path File
                  <span className="text-xs text-muted-foreground font-normal ml-2">(Opsional)</span>
                </Label>
                <Input
                  id="fileUrl"
                  name="fileUrl"
                  placeholder="/uploads/dokumen.pdf atau https://..."
                  defaultValue=""
                />
                <p className="text-xs text-muted-foreground">
                  💡 Kosongkan jika dokumen fisik atau belum diupload
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" className="min-w-[100px]">
                <Plus className="mr-2 h-4 w-4" />
                Simpan
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}


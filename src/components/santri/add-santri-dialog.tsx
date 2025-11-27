'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { createSantri } from "@/actions/santri-actions"
import { useState } from "react"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

export function AddSantriDialog({ lembagas, kelasList }: { lembagas: any[], kelasList: any[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [gender, setGender] = useState<string>('')
  const [lembagaId, setLembagaId] = useState<string>('')

  async function handleSubmit(formData: FormData) {
    setError(null)
    
    // Validate required fields
    if (!gender) {
      setError('Jenis Kelamin harus dipilih')
      return
    }
    if (!lembagaId) {
      setError('Lembaga harus dipilih')
      return
    }
    
    // Ensure all fields have values (set empty string if undefined)
    const fields = [
      'nis', 'nisn', 'nama', 'birthPlace', 'birthDate', 'address', 'phone', 'email',
      'bpjsNumber', 'kkNumber', 'nikNumber', 'previousSchool', 'status',
      'fatherName', 'fatherNik', 'fatherPhone', 'fatherJob', 'fatherIncome',
      'motherName', 'motherNik', 'motherPhone', 'motherJob', 'motherIncome',
      'waliName', 'waliNik', 'waliPhone', 'waliJob', 'waliRelation',
      'kelasId', 'asramaId', 'halqohId'
    ]
    
    fields.forEach(field => {
      if (!formData.has(field) || formData.get(field) === null) {
        formData.set(field, '')
      }
    })
    
    // Set required fields
    formData.set('gender', gender)
    formData.set('lembagaId', lembagaId)
    
    // Debug: log all form data
    console.log('Form data before submit:')
    console.log('Gender:', gender)
    console.log('LembagaId:', lembagaId)
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}: ${value}`)
    }
    
    const res = await createSantri(formData)
    if (res.success) {
      setOpen(false)
      setStep(1)
      setGender('')
      setLembagaId('')
      // Force reload to show new santri
      window.location.reload()
    } else {
      console.error('Create santri error:', res.error)
      setError(typeof res.error === 'string' ? res.error : 'Gagal membuat santri. Periksa console untuk detail.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setStep(1); }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-1" />
          Tambah Santri
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Santri Baru</DialogTitle>
          <DialogDescription>
            Isi formulir untuk menambahkan data santri baru
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        <form action={handleSubmit} className="grid gap-6 py-4">
          {/* Step 1: Personal Data - Always visible */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Data Pribadi</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nis">NIS *</Label>
                  <Input id="nis" name="nis" required />
                </div>
                <div>
                  <Label htmlFor="nisn">NISN</Label>
                  <Input id="nisn" name="nisn" />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="nama">Nama Lengkap *</Label>
                  <Input id="nama" name="nama" required />
                </div>
                <div>
                  <Label htmlFor="gender">Jenis Kelamin *</Label>
                  <Select name="gender" value={gender} onValueChange={setGender} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L">Laki-laki</SelectItem>
                      <SelectItem value="P">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="birthDate">Tanggal Lahir</Label>
                  <Input id="birthDate" name="birthDate" type="date" />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="birthPlace">Tempat Lahir</Label>
                  <Input id="birthPlace" name="birthPlace" />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="address">Alamat</Label>
                  <Input id="address" name="address" />
                </div>
                <div>
                  <Label htmlFor="phone">Telepon</Label>
                  <Input id="phone" name="phone" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" />
                </div>
              </div>
            </div>

            {/* Step 2: Guardian Data - Always visible */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Data Wali</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 font-medium">Ayah</div>
                <div>
                  <Label htmlFor="fatherName">Nama</Label>
                  <Input id="fatherName" name="fatherName" />
                </div>
                <div>
                  <Label htmlFor="fatherNik">NIK</Label>
                  <Input id="fatherNik" name="fatherNik" />
                </div>
                <div>
                  <Label htmlFor="fatherPhone">Telepon</Label>
                  <Input id="fatherPhone" name="fatherPhone" />
                </div>
                <div>
                  <Label htmlFor="fatherJob">Pekerjaan</Label>
                  <Input id="fatherJob" name="fatherJob" />
                </div>
                
                <div className="col-span-2 font-medium mt-2">Ibu</div>
                <div>
                  <Label htmlFor="motherName">Nama</Label>
                  <Input id="motherName" name="motherName" />
                </div>
                <div>
                  <Label htmlFor="motherNik">NIK</Label>
                  <Input id="motherNik" name="motherNik" />
                </div>
                <div>
                  <Label htmlFor="motherPhone">Telepon</Label>
                  <Input id="motherPhone" name="motherPhone" />
                </div>
                <div>
                  <Label htmlFor="motherJob">Pekerjaan</Label>
                  <Input id="motherJob" name="motherJob" />
                </div>

                <div className="col-span-2 font-medium mt-2">Wali (jika berbeda)</div>
                <div>
                  <Label htmlFor="waliName">Nama</Label>
                  <Input id="waliName" name="waliName" />
                </div>
                <div>
                  <Label htmlFor="waliRelation">Hubungan</Label>
                  <Input id="waliRelation" name="waliRelation" placeholder="contoh: Paman, Bibi" />
                </div>
                <div>
                  <Label htmlFor="waliPhone">Telepon</Label>
                  <Input id="waliPhone" name="waliPhone" />
                </div>
                <div>
                  <Label htmlFor="waliJob">Pekerjaan</Label>
                  <Input id="waliJob" name="waliJob" />
                </div>
              </div>
            </div>

            {/* Step 3: Administrative Data - Always visible */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Data Administratif</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bpjsNumber">Nomor BPJS</Label>
                  <Input id="bpjsNumber" name="bpjsNumber" />
                </div>
                <div>
                  <Label htmlFor="kkNumber">Nomor KK</Label>
                  <Input id="kkNumber" name="kkNumber" />
                </div>
                <div>
                  <Label htmlFor="nikNumber">NIK</Label>
                  <Input id="nikNumber" name="nikNumber" />
                </div>
                <div>
                  <Label htmlFor="previousSchool">Sekolah Sebelumnya</Label>
                  <Input id="previousSchool" name="previousSchool" />
                </div>
                <div>
                  <Label htmlFor="lembagaId">Lembaga *</Label>
                  <Select name="lembagaId" value={lembagaId} onValueChange={setLembagaId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Lembaga" />
                    </SelectTrigger>
                    <SelectContent>
                      {lembagas.map((l) => (
                        <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="kelasId">Kelas</Label>
                  <Select name="kelasId">
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Kelas (Opsional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {kelasList.map((kelas) => (
                        <SelectItem key={kelas.id} value={kelas.id}>
                          {kelas.lembaga.name} - {kelas.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue="ACTIVE">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Aktif</SelectItem>
                      <SelectItem value="GRADUATED">Lulus</SelectItem>
                      <SelectItem value="DROPPED">Keluar</SelectItem>
                      <SelectItem value="TRANSFERRED">Pindah</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit">Buat Santri</Button>
            </div>
          </form>
      </DialogContent>
    </Dialog>
  )
}

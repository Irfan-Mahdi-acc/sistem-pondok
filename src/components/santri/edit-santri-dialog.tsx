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
import { updateSantri } from "@/actions/santri-actions"
import { useState } from "react"
import { Edit } from "lucide-react"

export function EditSantriDialog({ santri }: { santri: any }) {
  const [open, setOpen] = useState(false)

  async function handleSubmit(formData: FormData) {
    const res = await updateSantri(santri.id, formData)
    if (res.success) {
      setOpen(false)
    } else {
      alert('Gagal mengupdate santri')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Edit className="h-4 w-4 mr-2" />
          Edit Profil
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Data Santri</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-4 py-4">
          {/* Personal Data */}
          <div className="space-y-4">
            <h3 className="font-semibold">Data Pribadi</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nis">NIS *</Label>
                <Input id="nis" name="nis" defaultValue={santri.nis} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nisn">NISN</Label>
                <Input id="nisn" name="nisn" defaultValue={santri.nisn || ''} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="nama">Nama Lengkap *</Label>
                <Input id="nama" name="nama" defaultValue={santri.nama} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Jenis Kelamin *</Label>
                <Select name="gender" defaultValue={santri.gender} required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Laki-laki</SelectItem>
                    <SelectItem value="P">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthPlace">Tempat Lahir</Label>
                <Input id="birthPlace" name="birthPlace" defaultValue={santri.birthPlace || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Tanggal Lahir</Label>
                <Input 
                  id="birthDate" 
                  name="birthDate" 
                  type="date" 
                  defaultValue={santri.birthDate ? new Date(santri.birthDate).toISOString().split('T')[0] : ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">No. Telepon</Label>
                <Input id="phone" name="phone" defaultValue={santri.phone || ''} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="address">Alamat</Label>
                <Input id="address" name="address" defaultValue={santri.address || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={santri.email || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={santri.status}>
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

          {/* Administrative Data */}
          <div className="space-y-4">
            <h3 className="font-semibold">Data Administratif</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bpjsNumber">No. BPJS</Label>
                <Input id="bpjsNumber" name="bpjsNumber" defaultValue={santri.bpjsNumber || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kkNumber">No. KK</Label>
                <Input id="kkNumber" name="kkNumber" defaultValue={santri.kkNumber || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nikNumber">NIK</Label>
                <Input id="nikNumber" name="nikNumber" defaultValue={santri.nikNumber || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="previousSchool">Sekolah Asal</Label>
                <Input id="previousSchool" name="previousSchool" defaultValue={santri.previousSchool || ''} />
              </div>
            </div>
          </div>

          {/* Guardian Data - Father */}
          <div className="space-y-4">
            <h3 className="font-semibold">Data Ayah</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fatherName">Nama Ayah</Label>
                <Input id="fatherName" name="fatherName" defaultValue={santri.fatherName || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fatherNik">NIK Ayah</Label>
                <Input id="fatherNik" name="fatherNik" defaultValue={santri.fatherNik || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fatherPhone">No. Telepon Ayah</Label>
                <Input id="fatherPhone" name="fatherPhone" defaultValue={santri.fatherPhone || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fatherJob">Pekerjaan Ayah</Label>
                <Input id="fatherJob" name="fatherJob" defaultValue={santri.fatherJob || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fatherIncome">Penghasilan Ayah</Label>
                <Input id="fatherIncome" name="fatherIncome" defaultValue={santri.fatherIncome || ''} />
              </div>
            </div>
          </div>

          {/* Guardian Data - Mother */}
          <div className="space-y-4">
            <h3 className="font-semibold">Data Ibu</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="motherName">Nama Ibu</Label>
                <Input id="motherName" name="motherName" defaultValue={santri.motherName || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="motherNik">NIK Ibu</Label>
                <Input id="motherNik" name="motherNik" defaultValue={santri.motherNik || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="motherPhone">No. Telepon Ibu</Label>
                <Input id="motherPhone" name="motherPhone" defaultValue={santri.motherPhone || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="motherJob">Pekerjaan Ibu</Label>
                <Input id="motherJob" name="motherJob" defaultValue={santri.motherJob || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="motherIncome">Penghasilan Ibu</Label>
                <Input id="motherIncome" name="motherIncome" defaultValue={santri.motherIncome || ''} />
              </div>
            </div>
          </div>

          {/* Guardian Data - Wali */}
          <div className="space-y-4">
            <h3 className="font-semibold">Data Wali (Opsional)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="waliName">Nama Wali</Label>
                <Input id="waliName" name="waliName" defaultValue={santri.waliName || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="waliRelation">Hubungan</Label>
                <Input id="waliRelation" name="waliRelation" defaultValue={santri.waliRelation || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="waliNik">NIK Wali</Label>
                <Input id="waliNik" name="waliNik" defaultValue={santri.waliNik || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="waliPhone">No. Telepon Wali</Label>
                <Input id="waliPhone" name="waliPhone" defaultValue={santri.waliPhone || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="waliJob">Pekerjaan Wali</Label>
                <Input id="waliJob" name="waliJob" defaultValue={santri.waliJob || ''} />
              </div>
            </div>
          </div>

          {/* Hidden fields for relations */}
          <input type="hidden" name="lembagaId" value={santri.lembagaId} />
          <input type="hidden" name="kelasId" value={santri.kelasId || ''} />
          <input type="hidden" name="asramaId" value={santri.asramaId || ''} />
          <input type="hidden" name="halqohId" value={santri.halqohId || ''} />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit">Simpan Perubahan</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

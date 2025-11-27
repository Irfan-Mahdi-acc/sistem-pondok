'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
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
import { Input } from "@/components/ui/input"
import { Upload, Download, FileSpreadsheet } from "lucide-react"
import { bulkImportSantri } from "@/actions/santri-actions"

export function BulkImportSantriDialog({ lembagas, kelasList }: { lembagas: any[], kelasList: any[] }) {
  const [open, setOpen] = useState(false)
  const [selectedLembaga, setSelectedLembaga] = useState<string>('')
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleDownloadTemplate = async () => {
    if (!selectedLembaga) {
      alert('Pilih lembaga terlebih dahulu')
      return
    }

    try {
      const XLSX = await import('xlsx')
      const lembaga = lembagas.find(l => l.id === selectedLembaga)
      const lembagaKelas = kelasList.filter(k => k.lembagaId === selectedLembaga)

      // Create template data
      const templateData = [
        {
          'NIS': 'Contoh: 2024001',
          'NISN': 'Contoh: 0012345678',
          'Nama Lengkap': 'Contoh: Ahmad Zaki',
          'Jenis Kelamin': 'L atau P',
          'Tempat Lahir': 'Contoh: Jakarta',
          'Tanggal Lahir': 'Format: YYYY-MM-DD (Contoh: 2010-01-15)',
          'Alamat': 'Contoh: Jl. Merdeka No. 123',
          'Telepon': 'Contoh: 081234567890',
          'Email': 'Contoh: ahmad@email.com',
          'Nama Ayah': 'Contoh: Budi Santoso',
          'Telepon Ayah': 'Contoh: 081234567890',
          'Pekerjaan Ayah': 'Contoh: Wiraswasta',
          'Nama Ibu': 'Contoh: Siti Aminah',
          'Telepon Ibu': 'Contoh: 081234567890',
          'Pekerjaan Ibu': 'Contoh: Ibu Rumah Tangga',
          'Nama Wali': 'Opsional',
          'Telepon Wali': 'Opsional',
          'Hubungan Wali': 'Opsional',
          'Kelas': lembagaKelas.length > 0 ? `Pilih: ${lembagaKelas.map(k => k.name).join(', ')}` : 'Kosongkan jika belum ada',
          'Tanggal Masuk': 'Format: YYYY-MM-DD (Contoh: 2024-07-01)',
          'Status': 'ACTIVE (default)',
        }
      ]

      // Create workbook
      const ws = XLSX.utils.json_to_sheet(templateData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Template Santri')

      // Set column widths
      ws['!cols'] = [
        { wch: 15 }, // NIS
        { wch: 15 }, // NISN
        { wch: 25 }, // Nama
        { wch: 15 }, // Gender
        { wch: 20 }, // Tempat Lahir
        { wch: 25 }, // Tanggal Lahir
        { wch: 40 }, // Alamat
        { wch: 20 }, // Telepon
        { wch: 25 }, // Email
        { wch: 25 }, // Nama Ayah
        { wch: 20 }, // Telepon Ayah
        { wch: 20 }, // Pekerjaan Ayah
        { wch: 25 }, // Nama Ibu
        { wch: 20 }, // Telepon Ibu
        { wch: 20 }, // Pekerjaan Ibu
        { wch: 25 }, // Nama Wali
        { wch: 20 }, // Telepon Wali
        { wch: 20 }, // Hubungan Wali
        { wch: 30 }, // Kelas
        { wch: 25 }, // Tanggal Masuk
        { wch: 15 }, // Status
      ]

      // Download
      XLSX.writeFile(wb, `Template_Santri_${lembaga?.name ?? 'Lembaga'}.xlsx`)
    } catch (error) {
      console.error('Gagal membuat template Excel:', error)
      alert('Gagal membuat template Excel. Silakan coba lagi.')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleImport = async () => {
    if (!file || !selectedLembaga) {
      alert('Pilih lembaga dan file Excel terlebih dahulu')
      return
    }

    setIsProcessing(true)

    try {
      const XLSX = await import('xlsx')
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      // Map Excel data to santri format
      const santriData = jsonData.map((row: any) => {
        // Find kelas by name
        const kelasName = row['Kelas']?.trim()
        const kelas = kelasName ? kelasList.find(k => 
          k.lembagaId === selectedLembaga && k.name === kelasName
        ) : null

        return {
          nis: row['NIS']?.toString() || '',
          nisn: row['NISN']?.toString() || null,
          nama: row['Nama Lengkap'] || '',
          gender: row['Jenis Kelamin'] === 'L' ? 'L' : 'P',
          birthPlace: row['Tempat Lahir'] || null,
          birthDate: row['Tanggal Lahir'] || null,
          address: row['Alamat'] || null,
          phone: row['Telepon']?.toString() || null,
          email: row['Email'] || null,
          fatherName: row['Nama Ayah'] || null,
          fatherPhone: row['Telepon Ayah']?.toString() || null,
          fatherJob: row['Pekerjaan Ayah'] || null,
          motherName: row['Nama Ibu'] || null,
          motherPhone: row['Telepon Ibu']?.toString() || null,
          motherJob: row['Pekerjaan Ibu'] || null,
          waliName: row['Nama Wali'] || null,
          waliPhone: row['Telepon Wali']?.toString() || null,
          waliRelation: row['Hubungan Wali'] || null,
          lembagaId: selectedLembaga,
          kelasId: kelas?.id || null,
          entryDate: row['Tanggal Masuk'] || null,
          status: row['Status'] || 'ACTIVE',
        }
      })

      // Call bulk import action
      const result = await bulkImportSantri(santriData)

      if (result.success) {
        alert(`Berhasil import ${result.count} santri!`)
        setOpen(false)
        setFile(null)
        setSelectedLembaga('')
      } else {
        alert('Gagal import: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Import error:', error)
      alert('Gagal memproses file Excel')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Import Massal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Santri Massal</DialogTitle>
          <DialogDescription>
            Download template Excel, isi data santri, lalu upload kembali
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Step 1: Select Lembaga */}
          <div className="space-y-2">
            <Label>1. Pilih Lembaga</Label>
            <Select value={selectedLembaga} onValueChange={setSelectedLembaga}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih lembaga" />
              </SelectTrigger>
              <SelectContent>
                {lembagas.map((lembaga) => (
                  <SelectItem key={lembaga.id} value={lembaga.id}>
                    {lembaga.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Step 2: Download Template */}
          <div className="space-y-2">
            <Label>2. Download Template</Label>
            <Button 
              onClick={handleDownloadTemplate} 
              disabled={!selectedLembaga}
              variant="outline"
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Template Excel
            </Button>
          </div>

          {/* Step 3: Upload File */}
          <div className="space-y-2">
            <Label>3. Upload File Excel</Label>
            <Input 
              type="file" 
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              disabled={!selectedLembaga}
            />
            {file && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                {file.name}
              </p>
            )}
          </div>

          {/* Step 4: Import */}
          <Button 
            onClick={handleImport} 
            disabled={!file || !selectedLembaga || isProcessing}
            className="w-full"
          >
            {isProcessing ? 'Memproses...' : 'Import Data'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

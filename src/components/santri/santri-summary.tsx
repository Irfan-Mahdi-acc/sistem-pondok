'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function SantriSummary({ santri }: { santri: any }) {
  const handleDownloadPDF = async () => {
    const { default: jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    
    // Add professional header
    const { addPDFHeader } = await import('@/lib/pdf-header')
    const startY = await addPDFHeader(doc, {
      title: 'RINGKASAN DATA SANTRI',
      date: `Dicetak pada: ${new Date().toLocaleString('id-ID')}`
    }, santri.lembagaId) // Pass lembagaId if available
    
    let yPos = startY + 10
    
    // Personal Information Section
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('INFORMASI PRIBADI', 20, yPos)
    yPos += 8
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Nama Lengkap: ${santri.nama}`, 20, yPos)
    yPos += 6
    doc.text(`NIS: ${santri.nis}`, 20, yPos)
    yPos += 6
    doc.text(`Jenis Kelamin: ${santri.gender === 'L' ? 'Laki-laki' : 'Perempuan'}`, 20, yPos)
    yPos += 6
    doc.text(`Tempat, Tanggal Lahir: ${santri.birthPlace || '-'}, ${santri.birthDate ? new Date(santri.birthDate).toLocaleDateString('id-ID') : '-'}`, 20, yPos)
    yPos += 6
    doc.text(`Status: ${santri.status}`, 20, yPos)
    yPos += 10
    
    // Academic Information Section
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('INFORMASI AKADEMIK', 20, yPos)
    yPos += 8
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Lembaga: ${santri.lembaga?.name || '-'}`, 20, yPos)
    yPos += 6
    doc.text(`Kelas: ${santri.kelas?.name || 'Belum ditentukan'}`, 20, yPos)
    yPos += 6
    doc.text(`Asrama: ${santri.asrama?.name || 'Belum ditentukan'}`, 20, yPos)
    yPos += 6
    doc.text(`Halqoh: ${santri.halqoh?.name || 'Belum ditentukan'}`, 20, yPos)
    yPos += 6
    doc.text(`Tanggal Masuk: ${santri.enrollmentDate ? new Date(santri.enrollmentDate).toLocaleDateString('id-ID') : '-'}`, 20, yPos)
    yPos += 10
    
    // Contact Information Section
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('KONTAK', 20, yPos)
    yPos += 8
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Telepon: ${santri.phone || '-'}`, 20, yPos)
    yPos += 6
    doc.text(`Email: ${santri.email || '-'}`, 20, yPos)
    yPos += 6
    doc.text(`Alamat: ${santri.address || '-'}`, 20, yPos)
    yPos += 10
    
    // Guardian Information Section
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('INFORMASI WALI', 20, yPos)
    yPos += 8
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Nama Wali: ${santri.guardianName || '-'}`, 20, yPos)
    yPos += 6
    doc.text(`Hubungan: ${santri.guardianRelation || '-'}`, 20, yPos)
    yPos += 6
    doc.text(`Telepon Wali: ${santri.guardianPhone || '-'}`, 20, yPos)
    yPos += 6
    doc.text(`Alamat Wali: ${santri.guardianAddress || '-'}`, 20, yPos)
    yPos += 10
    
    // Statistics Section
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('STATISTIK', 20, yPos)
    yPos += 8
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Catatan Tahfidz: ${santri._count?.tahfidzRecords || 0}`, 20, yPos)
    yPos += 6
    doc.text(`Pelanggaran: ${santri._count?.violations || 0}`, 20, yPos)
    yPos += 6
    doc.text(`Tagihan: ${santri._count?.billings || 0}`, 20, yPos)
    
    // Footer
    yPos = 280
    doc.setFontSize(8)
    doc.setFont('helvetica', 'italic')
    doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 105, yPos, { align: 'center' })
    
    // Save PDF
    doc.save(`Ringkasan_${santri.nama}_${santri.nis}.pdf`)
  }

  return (
    <div className="space-y-6">
      {/* Header with Download Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Ringkasan Data Santri</h2>
        <Button onClick={handleDownloadPDF} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informasi Pribadi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Nama Lengkap</span>
              <span className="text-sm font-medium">{santri.nama}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">NIS</span>
              <span className="text-sm font-medium">{santri.nis}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Jenis Kelamin</span>
              <span className="text-sm font-medium">{santri.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Tempat, Tanggal Lahir</span>
              <span className="text-sm font-medium">
                {santri.birthPlace || '-'}, {santri.birthDate ? new Date(santri.birthDate).toLocaleDateString('id-ID') : '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={santri.status === 'ACTIVE' ? 'default' : 'secondary'}>
                {santri.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Academic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informasi Akademik</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Lembaga</span>
              <span className="text-sm font-medium">{santri.lembaga?.name || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Kelas</span>
              <span className="text-sm font-medium">{santri.kelas?.name || 'Belum ditentukan'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Asrama</span>
              <span className="text-sm font-medium">{santri.asrama?.name || 'Belum ditentukan'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Halqoh</span>
              <span className="text-sm font-medium">{santri.halqoh?.name || 'Belum ditentukan'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Tanggal Masuk</span>
              <span className="text-sm font-medium">
                {santri.enrollmentDate ? new Date(santri.enrollmentDate).toLocaleDateString('id-ID') : '-'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Kontak</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Telepon</span>
              <span className="text-sm font-medium">{santri.phone || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm font-medium">{santri.email || '-'}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Alamat</span>
              <span className="text-sm font-medium">{santri.address || '-'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Guardian Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informasi Wali</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Nama Wali</span>
              <span className="text-sm font-medium">{santri.guardianName || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Hubungan</span>
              <span className="text-sm font-medium">{santri.guardianRelation || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Telepon Wali</span>
              <span className="text-sm font-medium">{santri.guardianPhone || '-'}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Alamat Wali</span>
              <span className="text-sm font-medium">{santri.guardianAddress || '-'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Statistik</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{santri._count?.tahfidzRecords || 0}</p>
                <p className="text-sm text-muted-foreground">Catatan Tahfidz</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{santri._count?.violations || 0}</p>
                <p className="text-sm text-muted-foreground">Pelanggaran</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{santri._count?.billings || 0}</p>
                <p className="text-sm text-muted-foreground">Tagihan</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

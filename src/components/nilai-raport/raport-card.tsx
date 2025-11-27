'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Printer, Loader2, Award } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { generateStudentPDF } from "@/lib/export-utils"

interface RaportCardProps {
  student: any
  nilaiData: any[]
  ujianHifdzData: any[]
  categories: any[]
  academicYearId: string
  semester: string
  kelasName: string
  ranking?: number
  totalStudents?: number
  raportNumber?: string
}

export function RaportCard({ 
  student, 
  nilaiData, 
  ujianHifdzData, 
  categories, 
  academicYearId, 
  semester, 
  kelasName,
  ranking,
  totalStudents
}: RaportCardProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  
  // Group nilai by category
  const mapelNilai = nilaiData.filter(n => n.category === 'UJIAN' || n.category === 'TUGAS')
  const nonMapelNilai = nilaiData.filter(n => n.category === 'NON_MAPEL')

  // Group Mapel by mapel name (each mapel can have UJIAN and TUGAS)
  const groupedMapel = mapelNilai.reduce((acc, nilai) => {
    const mapelName = nilai.mapel?.name || 'Unknown'
    
    if (!acc[mapelName]) {
      acc[mapelName] = []
    }
    acc[mapelName].push(nilai)
    return acc
  }, {} as Record<string, any[]>)

  // Group Non-Mapel by groupName
  const groupedNonMapel = nonMapelNilai.reduce((acc, nilai) => {
    const category = categories.find(c => c.id === nilai.categoryId)
    const groupName = category?.groupName || 'Lainnya'
    
    if (!acc[groupName]) {
      acc[groupName] = []
    }
    acc[groupName].push({ nilai, category })
    return acc
  }, {} as Record<string, Array<{ nilai: any; category: any }>>)

  // Calculate average for mapel
  const mapelAverage = mapelNilai.length > 0
    ? mapelNilai.reduce((sum, n) => sum + (n.score || 0), 0) / mapelNilai.length
    : 0

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = () => {
    setIsGeneratingPDF(true)
    try {
      generateStudentPDF(student, kelasName, semester, nilaiData, ujianHifdzData, categories)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Gagal generate PDF. Silakan coba lagi.')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  return (
    <Card className="print:shadow-none">
      <CardHeader className="print:pb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <CardTitle className="text-xl">{student.nama}</CardTitle>
              {ranking && totalStudents && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  Ranking {ranking} dari {totalStudents}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">NIS: {student.nis}</Badge>
              <Badge variant="secondary">Semester {semester}</Badge>
            </div>
          </div>
          <div className="flex gap-2 print:hidden">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Cetak
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
            >
              {isGeneratingPDF ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Nilai Mapel - Grouped by Mapel Name */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center justify-between">
            <span>Nilai Mata Pelajaran</span>
            {mapelAverage > 0 && (
              <Badge variant="default">
                Rata-rata: {mapelAverage.toFixed(1)}
              </Badge>
            )}
          </h3>
          {mapelNilai.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada nilai</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedMapel).map(([mapelName, nilaiList]) => {
                const avgScore = nilaiList.reduce((sum: number, n: any) => sum + (n.score || 0), 0) / nilaiList.length
                return (
                  <div key={mapelName} className="border rounded-lg p-4 bg-muted/20">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-sm text-primary">{mapelName}</h4>
                      <Badge variant="outline">Rata-rata: {avgScore.toFixed(1)}</Badge>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Jenis Ujian</TableHead>
                          <TableHead className="text-center">Nilai</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {nilaiList.map((nilai: any) => (
                          <TableRow key={nilai.id}>
                            <TableCell>{nilai.ujian?.name || nilai.category}</TableCell>
                            <TableCell className="text-center font-semibold">
                              {nilai.score || '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Nilai Non-Mapel - Grouped by groupName with Table */}
        <div>
          <h3 className="font-semibold mb-3">Nilai Non-Mapel</h3>
          {nonMapelNilai.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada nilai</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedNonMapel).map(([groupName, items]) => (
                <div key={groupName} className="border rounded-lg p-4 bg-muted/20">
                  <h4 className="font-semibold text-sm mb-3 text-primary">{groupName}</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kategori</TableHead>
                        <TableHead className="text-center">Nilai</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map(({ nilai, category }: any) => (
                        <TableRow key={nilai.id}>
                          <TableCell>{category?.name || '-'}</TableCell>
                          <TableCell className="text-center font-semibold">
                            {nilai.gradeType === 'NUMERIC' ? nilai.score : nilai.letterGrade}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Nilai Tahfidz - Ujian Hifdz */}
        <div>
          <h3 className="font-semibold mb-3">Nilai Tahfidz</h3>
          {ujianHifdzData.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada nilai</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Surah</TableHead>
                  <TableHead className="text-center">Ayat</TableHead>
                  <TableHead className="text-center">Nilai</TableHead>
                  <TableHead>Keterangan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ujianHifdzData.map((ujian) => (
                  <TableRow key={ujian.id}>
                    <TableCell>{ujian.surah}</TableCell>
                    <TableCell className="text-center">
                      {ujian.ayatStart} - {ujian.ayatEnd}
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      {ujian.grade || '-'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {ujian.note || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

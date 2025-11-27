'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Printer } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useState } from "react"

interface ComprehensiveRaportProps {
  student: any
  nilaiData: any[]
  ujianHifdzData: any[]
  categories: any[]
  academicYear: string
  semester: string
  kelasName: string
  lembagaName: string
  ranking?: number
  totalStudents?: number
  raportNumber?: string
}

// Helper function to calculate grade predicate (1-10 scale)
function getGradePredicate(score: number): { predicate: string; description: string; color: string } {
  if (score >= 9) return { predicate: "A", description: "Sangat Baik", color: "text-green-600" }
  if (score >= 8) return { predicate: "B", description: "Baik", color: "text-blue-600" }
  if (score >= 7) return { predicate: "C", description: "Cukup", color: "text-yellow-600" }
  if (score >= 6) return { predicate: "D", description: "Kurang", color: "text-orange-600" }
  return { predicate: "E", description: "Sangat Kurang", color: "text-red-600" }
}

export function ComprehensiveRaport({
  student,
  nilaiData,
  ujianHifdzData,
  categories,
  academicYear,
  semester,
  kelasName,
  lembagaName,
  ranking,
  totalStudents,
  raportNumber
}: ComprehensiveRaportProps) {
  const [isPrinting, setIsPrinting] = useState(false)

  // Group nilai by category
  const mapelNilai = nilaiData.filter(n => n.category === 'UJIAN' || n.category === 'TUGAS')
  const nonMapelNilai = nilaiData.filter(n => n.category === 'NON_MAPEL')

  // Group Mapel by mapel name and calculate average
  const groupedMapel = mapelNilai.reduce((acc, nilai) => {
    const mapelName = nilai.mapel?.name || 'Unknown'
    if (!acc[mapelName]) {
      acc[mapelName] = []
    }
    acc[mapelName].push(nilai)
    return acc
  }, {} as Record<string, any[]>)

  // Calculate mapel averages
  const mapelWithAverages = (Object.entries(groupedMapel) as [string, any[]][]).map(([mapelName, nilaiList]) => {
    const scores = nilaiList.filter((n: any) => n.score).map((n: any) => n.score)
    const average = scores.length > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 0
    const predicate = getGradePredicate(average)
    return {
      mapelName,
      nilaiList,
      average,
      predicate
    }
  })

  // Calculate overall average
  const allMapelScores = mapelNilai.filter(n => n.score).map(n => n.score)
  const overallAverage = allMapelScores.length > 0 
    ? allMapelScores.reduce((a, b) => a + b, 0) / allMapelScores.length 
    : 0
  const overallPredicate = getGradePredicate(overallAverage)

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

  const handlePrint = () => {
    setIsPrinting(true)
    setTimeout(() => {
      window.print()
      setIsPrinting(false)
    }, 100)
  }

  const handleDownloadPDF = () => {
    // Use browser print to PDF functionality
    window.print()
  }

  return (
    <div className="w-full max-w-[210mm] mx-auto">
      {/* Print Controls - Hidden when printing */}
      <div className="print:hidden mb-4 flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Cetak
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
      </div>

      {/* Raport Card - A4 Size with proper spacing for print */}
      <Card className="print:shadow-none print:border-none bg-white">
        <CardContent className="p-8 print:p-12 space-y-6">
          {/* Header / KOP */}
          <div className="text-center space-y-2 pb-4 border-b-2 border-primary">
            <h1 className="text-2xl font-bold text-primary uppercase tracking-wide">
              {lembagaName}
            </h1>
            <p className="text-sm text-muted-foreground">
              Laporan Hasil Belajar Santri (Raport)
            </p>
            <p className="text-xs text-muted-foreground">
              Tahun Akademik {academicYear} - Semester {semester}
            </p>
          </div>

          {/* Student Information */}
          <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
            <div className="space-y-2">
              <div className="flex">
                <span className="w-32 font-medium">Nama</span>
                <span className="flex-1">: {student.nama}</span>
              </div>
              <div className="flex">
                <span className="w-32 font-medium">NIS</span>
                <span className="flex-1">: {student.nis}</span>
              </div>
              {student.nisn && (
                <div className="flex">
                  <span className="w-32 font-medium">NISN</span>
                  <span className="flex-1">: {student.nisn}</span>
                </div>
              )}
              <div className="flex">
                <span className="w-32 font-medium">Kelas</span>
                <span className="flex-1">: {kelasName}</span>
              </div>
            </div>
            <div className="space-y-2">
              {raportNumber && (
                <div className="flex">
                  <span className="w-32 font-medium">No. Raport</span>
                  <span className="flex-1">: {raportNumber}</span>
                </div>
              )}
              {ranking && totalStudents && (
                <div className="flex">
                  <span className="w-32 font-medium">Ranking</span>
                  <span className="flex-1">: {ranking} dari {totalStudents} santri</span>
                </div>
              )}
              <div className="flex">
                <span className="w-32 font-medium">Semester</span>
                <span className="flex-1">: {semester}</span>
              </div>
              <div className="flex">
                <span className="w-32 font-medium">Tahun Ajaran</span>
                <span className="flex-1">: {academicYear}</span>
              </div>
            </div>
          </div>

          {/* Academic Performance Summary */}
          <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rata-rata Keseluruhan</p>
                <p className="text-3xl font-bold text-primary">{overallAverage.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <Badge variant="outline" className={`text-lg px-4 py-2 ${overallPredicate.color}`}>
                  {overallPredicate.predicate}
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">{overallPredicate.description}</p>
              </div>
            </div>
          </div>

          {/* Nilai Mata Pelajaran */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-border" />
              <h2 className="text-lg font-bold text-primary">A. NILAI MATA PELAJARAN</h2>
              <div className="h-px flex-1 bg-border" />
            </div>
            
            {mapelWithAverages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Belum ada nilai mata pelajaran</p>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted">
                    <TableRow>
                      <TableHead className="w-12 text-center font-bold">No</TableHead>
                      <TableHead className="font-bold">Mata Pelajaran</TableHead>
                      <TableHead className="text-center font-bold">Nilai</TableHead>
                      <TableHead className="text-center font-bold w-20">Predikat</TableHead>
                      <TableHead className="font-bold">Keterangan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mapelWithAverages.map((item, index) => (
                      <TableRow key={item.mapelName}>
                        <TableCell className="text-center font-medium">{index + 1}</TableCell>
                        <TableCell className="font-medium">{item.mapelName}</TableCell>
                        <TableCell className="text-center font-bold text-lg">
                          {item.average.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={item.predicate.color}>
                            {item.predicate.predicate}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{item.predicate.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Nilai Non-Mapel (Akhlak, Kepribadian, dll) */}
          {Object.keys(groupedNonMapel).length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-border" />
                <h2 className="text-lg font-bold text-primary">B. PENILAIAN SIKAP & KEPRIBADIAN</h2>
                <div className="h-px flex-1 bg-border" />
              </div>

              {(Object.entries(groupedNonMapel) as [string, any[]][]).map(([groupName, items], groupIndex: number) => (
                <div key={groupName} className="space-y-2">
                  <h3 className="font-semibold text-sm bg-muted px-3 py-2 rounded">
                    {groupIndex + 1}. {groupName}
                  </h3>
                  <div className="border rounded-lg overflow-hidden ml-4">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead className="w-12 text-center">No</TableHead>
                          <TableHead>Aspek Penilaian</TableHead>
                          <TableHead className="text-center w-32">Nilai</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map(({ nilai, category }: any, index: number) => (
                          <TableRow key={nilai.id}>
                            <TableCell className="text-center">{index + 1}</TableCell>
                            <TableCell>{category?.name || '-'}</TableCell>
                            <TableCell className="text-center font-semibold">
                              {nilai.gradeType === 'NUMERIC' ? nilai.score : nilai.letterGrade}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Nilai Tahfidz */}
          {ujianHifdzData.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-border" />
                <h2 className="text-lg font-bold text-primary">C. CAPAIAN TAHFIDZ</h2>
                <div className="h-px flex-1 bg-border" />
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted">
                    <TableRow>
                      <TableHead className="w-12 text-center">No</TableHead>
                      <TableHead>Surah</TableHead>
                      <TableHead className="text-center">Ayat</TableHead>
                      <TableHead className="text-center w-24">Nilai</TableHead>
                      <TableHead>Keterangan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ujianHifdzData.map((ujian, index) => (
                      <TableRow key={ujian.id}>
                        <TableCell className="text-center">{index + 1}</TableCell>
                        <TableCell className="font-medium">{ujian.surah}</TableCell>
                        <TableCell className="text-center">
                          {ujian.ayatStart} - {ujian.ayatEnd}
                        </TableCell>
                        <TableCell className="text-center font-bold">
                          {ujian.grade || '-'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {ujian.note || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Grade Scale Reference */}
          <div className="bg-muted/30 p-4 rounded-lg mt-6">
            <h3 className="font-semibold text-sm mb-3">Keterangan Skala Nilai</h3>
            <div className="grid grid-cols-5 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-green-600">A</Badge>
                <span>9.0 - 10 (Sangat Baik)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-blue-600">B</Badge>
                <span>8.0 - 8.9 (Baik)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-yellow-600">C</Badge>
                <span>7.0 - 7.9 (Cukup)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-orange-600">D</Badge>
                <span>6.0 - 6.9 (Kurang)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-red-600">E</Badge>
                <span>&lt; 6.0 (Sangat Kurang)</span>
              </div>
            </div>
          </div>

          {/* Signature Section */}
          <div className="grid grid-cols-2 gap-8 mt-12 pt-8 border-t">
            <div className="text-center space-y-16">
              <div>
                <p className="text-sm mb-2">Orang Tua / Wali</p>
                <div className="h-20 border-b border-dashed border-muted-foreground/50 mb-2"></div>
                <p className="text-sm font-medium">( __________________ )</p>
              </div>
            </div>
            <div className="text-center space-y-16">
              <div>
                <p className="text-sm mb-2">Wali Kelas</p>
                <div className="h-20 border-b border-dashed border-muted-foreground/50 mb-2"></div>
                <p className="text-sm font-medium">( __________________ )</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground pt-4 border-t">
            <p>Raport ini dicetak pada: {new Date().toLocaleDateString('id-ID', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
        </CardContent>
      </Card>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          
          .print\\:border-none {
            border: none !important;
          }
          
          .print\\:p-12 {
            padding: 3rem !important;
          }
          
          /* Prevent page breaks inside important elements */
          table, .space-y-3 > div {
            page-break-inside: avoid;
          }
          
          /* Force specific page breaks */
          .page-break-before {
            page-break-before: always;
          }
          
          .page-break-after {
            page-break-after: always;
          }
        }
      `}</style>
    </div>
  )
}


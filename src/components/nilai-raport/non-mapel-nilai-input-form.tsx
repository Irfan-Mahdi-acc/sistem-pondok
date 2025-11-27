'use client'

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { saveNonMapelNilai } from "@/actions/nilai-actions"
import { useRouter } from "next/navigation"
import { Save } from "lucide-react"

interface NonMapelNilaiInputFormProps {
  categoryId: string
  santriList: any[]
  existingNilai: any[]
  academicYearId: string
  semester: string
  gradeType: string
}

const LETTER_GRADES = ['A', 'B', 'C', 'D', 'E']

export function NonMapelNilaiInputForm({ 
  categoryId, 
  santriList, 
  existingNilai, 
  academicYearId, 
  semester,
  gradeType 
}: NonMapelNilaiInputFormProps) {
  const router = useRouter()
  const [grades, setGrades] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    existingNilai.forEach(nilai => {
      if (gradeType === 'NUMERIC') {
        initial[nilai.santriId] = nilai.score?.toString() || ''
      } else {
        initial[nilai.santriId] = nilai.letterGrade || ''
      }
    })
    return initial
  })
  const [saving, setSaving] = useState(false)

  const handleGradeChange = (santriId: string, value: string) => {
    setGrades(prev => ({ ...prev, [santriId]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    
    const nilaiData = Object.entries(grades)
      .filter(([_, grade]) => grade && grade !== '')
      .map(([santriId, grade]) => ({
        santriId,
        categoryId,
        gradeType,
        score: gradeType === 'NUMERIC' ? parseFloat(grade) : undefined,
        letterGrade: gradeType === 'LETTER' ? grade : undefined,
        academicYearId,
        semester
      }))

    const result = await saveNonMapelNilai(nilaiData)

    if (result.success) {
      router.refresh()
      alert('Nilai berhasil disimpan')
    } else {
      alert(result.error || 'Gagal menyimpan nilai')
    }

    setSaving(false)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">No</TableHead>
              <TableHead>NIS</TableHead>
              <TableHead>Nama Santri</TableHead>
              <TableHead className="w-40">
                Nilai {gradeType === 'NUMERIC' ? '(0-100)' : '(A-E)'}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {santriList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Tidak ada santri di lembaga ini
                </TableCell>
              </TableRow>
            ) : (
              santriList.map((santri, index) => (
                <TableRow key={santri.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{santri.nis}</TableCell>
                  <TableCell>{santri.nama}</TableCell>
                  <TableCell>
                    {gradeType === 'NUMERIC' ? (
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={grades[santri.id] || ''}
                        onChange={(e) => handleGradeChange(santri.id, e.target.value)}
                        placeholder="0-100"
                      />
                    ) : (
                      <Select
                        value={grades[santri.id] || ''}
                        onValueChange={(value) => handleGradeChange(santri.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih" />
                        </SelectTrigger>
                        <SelectContent>
                          {LETTER_GRADES.map((grade) => (
                            <SelectItem key={grade} value={grade}>
                              {grade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving || santriList.length === 0}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Menyimpan...' : 'Simpan Nilai'}
        </Button>
      </div>
    </div>
  )
}

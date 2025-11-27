'use client'

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { saveNilai } from "@/actions/nilai-actions"
import { useRouter } from "next/navigation"
import { Save } from "lucide-react"

interface NilaiInputFormProps {
  examId: string
  santriList: any[]
  existingNilai: any[]
  academicYearId: string
  semester: string
}

export function NilaiInputForm({ examId, santriList, existingNilai, academicYearId, semester }: NilaiInputFormProps) {
  const router = useRouter()
  const [scores, setScores] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    existingNilai.forEach(nilai => {
      initial[nilai.santriId] = nilai.score?.toString() || ''
    })
    return initial
  })
  const [saving, setSaving] = useState(false)

  const handleScoreChange = (santriId: string, value: string) => {
    // Validate input: only allow numbers 1-10
    const numValue = parseFloat(value)
    if (value === '' || (numValue >= 1 && numValue <= 10)) {
      setScores(prev => ({ ...prev, [santriId]: value }))
    }
  }

  const handleSave = async () => {
    setSaving(true)
    
    // Validate all scores are within 1-10 range
    const invalidScores = Object.entries(scores).filter(([_, score]) => {
      if (score === '') return false
      const num = parseFloat(score)
      return num < 1 || num > 10
    })

    if (invalidScores.length > 0) {
      alert('Semua nilai harus antara 1-10')
      setSaving(false)
      return
    }

    const nilaiData = Object.entries(scores)
      .filter(([_, score]) => score !== '') // Only save non-empty scores
      .map(([santriId, score]) => ({
        santriId,
        examId,
        score: parseFloat(score),
        academicYearId,
        semester
      }))

    const result = await saveNilai(nilaiData)

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
              <TableHead className="w-32">Nilai (1-10)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {santriList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Tidak ada santri di kelas ini
                </TableCell>
              </TableRow>
            ) : (
              santriList.map((santri, index) => (
                <TableRow key={santri.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{santri.nis}</TableCell>
                  <TableCell>{santri.nama}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      step="0.1"
                      value={scores[santri.id] || ''}
                      onChange={(e) => handleScoreChange(santri.id, e.target.value)}
                      placeholder="1-10"
                      className="text-center"
                    />
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

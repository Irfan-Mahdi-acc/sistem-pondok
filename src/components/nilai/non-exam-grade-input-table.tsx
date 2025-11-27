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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { saveNonExamGrade, bulkSaveNonExamGrades } from "@/actions/non-exam-grade-actions"
import { Loader2, Save } from "lucide-react"

type Santri = {
  id: string
  nis: string
  nama: string
  letterGrade: string | null
}

interface NonExamGradeInputTableProps {
  mapelId: string
  category: string
  santriList: Santri[]
}

const LETTER_GRADES = ['A', 'B', 'C', 'D', 'E'] as const

export function NonExamGradeInputTable({ 
  mapelId, 
  category, 
  santriList 
}: NonExamGradeInputTableProps) {
  const [grades, setGrades] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    santriList.forEach(s => {
      if (s.letterGrade) {
        initial[s.id] = s.letterGrade
      }
    })
    return initial
  })
  const [saving, setSaving] = useState<string | null>(null)
  const [bulkSaving, setBulkSaving] = useState(false)

  const handleGradeChange = async (santriId: string, letterGrade: string) => {
    setGrades(prev => ({ ...prev, [santriId]: letterGrade }))
    
    // Auto-save individual grade
    setSaving(santriId)
    await saveNonExamGrade(mapelId, santriId, category, letterGrade)
    setSaving(null)
  }

  const handleBulkSave = async () => {
    setBulkSaving(true)
    
    const gradeData = Object.entries(grades).map(([santriId, letterGrade]) => ({
      santriId,
      letterGrade
    }))
    
    await bulkSaveNonExamGrades(mapelId, category, gradeData)
    setBulkSaving(false)
  }

  const setAllGrades = (grade: string) => {
    const newGrades: Record<string, string> = {}
    santriList.forEach(s => {
      newGrades[s.id] = grade
    })
    setGrades(newGrades)
  }

  return (
    <div className="space-y-4">
      {/* Quick Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Set semua nilai:</span>
          {LETTER_GRADES.map(grade => (
            <Button 
              key={grade} 
              variant="outline" 
              size="sm"
              onClick={() => setAllGrades(grade)}
            >
              {grade}
            </Button>
          ))}
        </div>
        <Button onClick={handleBulkSave} disabled={bulkSaving}>
          {bulkSaving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
          ) : (
            <Save className="h-4 w-4 mr-1" />
          )}
          Simpan Semua
        </Button>
      </div>

      {/* Grade Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">No</TableHead>
              <TableHead className="w-32">NIS</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead className="w-40">Nilai</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {santriList.map((santri, index) => (
              <TableRow key={santri.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-mono">{santri.nis}</TableCell>
                <TableCell>{santri.nama}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Select
                      value={grades[santri.id] || ''}
                      onValueChange={(value) => handleGradeChange(santri.id, value)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue placeholder="-" />
                      </SelectTrigger>
                      <SelectContent>
                        {LETTER_GRADES.map(grade => (
                          <SelectItem key={grade} value={grade}>
                            {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {saving === santri.id && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {santriList.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Tidak ada santri di kelas ini
        </div>
      )}
    </div>
  )
}


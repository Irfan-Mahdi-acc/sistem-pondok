'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Save } from "lucide-react"
import { saveStudentNonMapelNilai } from "@/actions/nilai-actions"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface PerStudentNonMapelFormProps {
  students: any[]
  categories: any[]
  grouped: Record<string, any[]>
  existingNilai: any[]
  lembagaId: string
  academicYearId: string
  semester: string
}

const LETTER_GRADES = ['A', 'B', 'C', 'D', 'E']

export function PerStudentNonMapelForm({
  students,
  categories,
  grouped,
  existingNilai,
  lembagaId,
  academicYearId,
  semester
}: PerStudentNonMapelFormProps) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [grades, setGrades] = useState<Record<string, { score?: number; letterGrade?: string }>>({})
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<string>('')

  const currentStudent = students[currentIndex]
  const totalStudents = students.length
  const progress = ((currentIndex + 1) / totalStudents) * 100

  // Load existing grades for current student
  useEffect(() => {
    if (!currentStudent) return

    const studentGrades: Record<string, { score?: number; letterGrade?: string }> = {}
    
    existingNilai.forEach(nilai => {
      if (nilai.santriId === currentStudent.id && nilai.categoryId) {
        studentGrades[nilai.categoryId] = {
          score: nilai.score,
          letterGrade: nilai.letterGrade
        }
      }
    })

    setGrades(studentGrades)
  }, [currentIndex, currentStudent, existingNilai])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return

      if (e.key === 'ArrowLeft' || e.key === 'p') {
        handlePrevious()
      } else if (e.key === 'ArrowRight' || e.key === 'n') {
        handleNext()
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentIndex, grades])

  const handleGradeChange = (categoryId: string, type: 'score' | 'letterGrade', value: string) => {
    setGrades(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [type]: type === 'score' ? parseFloat(value) || undefined : value
      }
    }))
  }

  const handleSave = async (moveNext = false) => {
    setSaving(true)
    setSaveStatus('Menyimpan...')

    const gradeData = Object.entries(grades)
      .filter(([_, grade]) => grade.score !== undefined || grade.letterGrade)
      .map(([categoryId, grade]) => {
        const category = categories.find(c => c.id === categoryId)
        return {
          categoryId,
          gradeType: category?.gradeType || 'LETTER',
          score: grade.score,
          letterGrade: grade.letterGrade
        }
      })

    const result = await saveStudentNonMapelNilai({
      santriId: currentStudent.id,
      lembagaId,
      academicYearId,
      semester,
      grades: gradeData
    })

    if (result.success) {
      setSaveStatus('✓ Tersimpan')
      setTimeout(() => setSaveStatus(''), 2000)
      
      if (moveNext && currentIndex < totalStudents - 1) {
        setCurrentIndex(prev => prev + 1)
      }
      
      router.refresh()
    } else {
      setSaveStatus('✗ Gagal menyimpan')
      alert(result.error || 'Gagal menyimpan nilai')
    }

    setSaving(false)
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < totalStudents - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const handleSaveAndNext = async () => {
    await handleSave(true)
  }

  return (
    <div className="space-y-4">
      {/* Navigation Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Sebelumnya
            </Button>

            <div className="flex-1 mx-4">
              <Select
                value={currentIndex.toString()}
                onValueChange={(value) => setCurrentIndex(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue>
                    Santri {currentIndex + 1} dari {totalStudents}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {students.map((student, index) => (
                    <SelectItem key={student.id} value={index.toString()}>
                      {index + 1}. {student.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              onClick={handleNext}
              disabled={currentIndex === totalStudents - 1}
            >
              Selanjutnya
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-center mt-2">
            Progress: {currentIndex + 1}/{totalStudents} ({Math.round(progress)}%)
          </p>
        </CardContent>
      </Card>

      {/* Student Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{currentStudent.nama}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">NIS: {currentStudent.nis}</Badge>
                {saveStatus && (
                  <Badge variant={saveStatus.includes('✓') ? 'default' : 'destructive'}>
                    {saveStatus}
                  </Badge>
                )}
              </div>
            </div>
            <Button onClick={() => handleSave(false)} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              Simpan
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Grade Input Forms */}
      <div className="space-y-4">
        {Object.keys(grouped).sort().map(groupName => (
          <Card key={groupName}>
            <CardHeader>
              <CardTitle className="text-lg">
                {groupName === 'Ungrouped' ? 'Tanpa Grup' : groupName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {grouped[groupName].map(category => (
                <div key={category.id} className="grid grid-cols-2 gap-4 items-center">
                  <Label htmlFor={category.id} className="text-base">
                    {category.name}
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {category.gradeType === 'NUMERIC' ? '0-100' : 'A-E'}
                    </Badge>
                  </Label>

                  {category.gradeType === 'NUMERIC' ? (
                    <Input
                      id={category.id}
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={grades[category.id]?.score || ''}
                      onChange={(e) => handleGradeChange(category.id, 'score', e.target.value)}
                      placeholder="0-100"
                    />
                  ) : (
                    <Select
                      value={grades[category.id]?.letterGrade || ''}
                      onValueChange={(value) => handleGradeChange(category.id, 'letterGrade', value)}
                    >
                      <SelectTrigger id={category.id}>
                        <SelectValue placeholder="Pilih nilai" />
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
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Sebelumnya
            </Button>

            <div className="text-sm text-muted-foreground">
              Keyboard: ← → untuk navigasi, Ctrl+S untuk simpan
            </div>

            {currentIndex < totalStudents - 1 ? (
              <Button onClick={handleSaveAndNext} disabled={saving}>
                Simpan & Lanjut
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={() => handleSave(false)} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                Simpan
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

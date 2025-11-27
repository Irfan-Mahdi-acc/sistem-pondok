"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useRouter, useSearchParams } from "next/navigation"
import { Calendar, BookOpen } from "lucide-react"

interface SemesterSelectorProps {
  lembagaId: string
  academicYears: any[]
  selectedAcademicYearId?: string
  selectedSemester?: string
}

export function SemesterSelector({ 
  lembagaId, 
  academicYears, 
  selectedAcademicYearId,
  selectedSemester 
}: SemesterSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleAcademicYearChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('academicYearId', value)
    if (!selectedSemester) params.set('semester', '1')
    router.push(`/dashboard/academic/nilai-raport/${lembagaId}?${params.toString()}`)
  }

  const handleSemesterChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('semester', value)
    router.push(`/dashboard/academic/nilai-raport/${lembagaId}?${params.toString()}`)
  }

  // Get active academic year as default
  const activeYear = academicYears.find(y => y.isActive)
  const defaultAcademicYearId = selectedAcademicYearId || activeYear?.id || academicYears[0]?.id

  // Determine active semester based on current date
  // Semester 1: July (7) - December (12)
  // Semester 2: January (1) - June (6)
  const currentMonth = new Date().getMonth() + 1 // getMonth() returns 0-11
  const currentSemester = currentMonth >= 7 ? '1' : '2'
  const isActiveYear = activeYear?.id === defaultAcademicYearId

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Tahun Akademik
            </label>
            <Select value={defaultAcademicYearId} onValueChange={handleAcademicYearChange}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Tahun Akademik" />
              </SelectTrigger>
              <SelectContent>
                {academicYears.map((year) => (
                  <SelectItem key={year.id} value={year.id}>
                    {year.name} {year.isActive && '(Aktif)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Semester
            </label>
            <Select value={selectedSemester || '1'} onValueChange={handleSemesterChange}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">
                  <div className="flex items-center gap-2">
                    Semester 1
                    {isActiveYear && currentSemester === '1' && (
                      <Badge variant="default" className="ml-2 text-xs">Berlangsung</Badge>
                    )}
                  </div>
                </SelectItem>
                <SelectItem value="2">
                  <div className="flex items-center gap-2">
                    Semester 2
                    {isActiveYear && currentSemester === '2' && (
                      <Badge variant="default" className="ml-2 text-xs">Berlangsung</Badge>
                    )}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

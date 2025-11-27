"use client"

import { useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface GradeTypeSelectorProps {
  lembagaId: string
  currentGradeType: string
}

export function GradeTypeSelector({ lembagaId, currentGradeType }: GradeTypeSelectorProps) {
  const router = useRouter()

  return (
    <Select 
      value={currentGradeType} 
      onValueChange={(value) => {
        router.push(`/dashboard/lembaga/${lembagaId}/grades?gradeType=${value}`)
      }}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="LETTER">Huruf (A-E)</SelectItem>
        <SelectItem value="NUMERIC">Angka (0-100)</SelectItem>
      </SelectContent>
    </Select>
  )
}

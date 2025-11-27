"use client"

import { useState, useTransition } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Save, Trash2, Check, X } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { bulkCreateLembagaGrades, deleteLembagaGrade } from "@/actions/lembaga-grade-actions"
import { getLetterGradeColor } from "@/lib/grade-utils"
import { useToast } from "@/components/ui/toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface SantriGrade {
  id: string
  nis: string
  nama: string
  nilaiId: string | null
  gradeType: "NUMERIC" | "LETTER"
  score: number | null
  letterGrade: string | null
}

interface LembagaGradeInputTableProps {
  lembagaId: string
  category: string
  categoryLabel: string
  gradeType: "NUMERIC" | "LETTER"
  santriList: SantriGrade[]
}

const LETTER_GRADES = ["A", "B", "C", "D", "E"] as const

function getScoreColor(score: number | null): string {
  if (score === null) return ""
  if (score >= 90) return "text-green-600 dark:text-green-400 font-bold"
  if (score >= 80) return "text-blue-600 dark:text-blue-400 font-bold"
  if (score >= 70) return "text-yellow-600 dark:text-yellow-400"
  if (score >= 60) return "text-orange-600 dark:text-orange-400"
  return "text-red-600 dark:text-red-400"
}

export function LembagaGradeInputTable({ 
  lembagaId, 
  category, 
  categoryLabel,
  gradeType,
  santriList 
}: LembagaGradeInputTableProps) {
  const [gradeData, setGradeData] = useState<Record<string, { score: number | null; letterGrade: string | null }>>(
    santriList.reduce((acc, santri) => ({
      ...acc,
      [santri.id]: { score: santri.score, letterGrade: santri.letterGrade }
    }), {})
  )
  const [isPending, startTransition] = useTransition()
  const { showToast } = useToast()

  const handleScoreChange = (santriId: string, value: string) => {
    const numValue = value === "" ? null : parseFloat(value)
    setGradeData(prev => ({
      ...prev,
      [santriId]: { ...prev[santriId], score: numValue }
    }))
  }

  const handleLetterGradeChange = (santriId: string, value: string) => {
    setGradeData(prev => ({
      ...prev,
      [santriId]: { ...prev[santriId], letterGrade: value === "CLEAR" ? null : value }
    }))
  }

  const handleSaveAll = () => {
    startTransition(async () => {
      const dataToSave = santriList.map(santri => ({
        santriId: santri.id,
        score: gradeData[santri.id]?.score,
        letterGrade: gradeData[santri.id]?.letterGrade,
        nilaiId: santri.nilaiId,
      })).filter(item => {
        if (gradeType === "NUMERIC") {
          return item.score !== null && item.score !== undefined
        } else {
          return item.letterGrade !== null
        }
      })

      const result = await bulkCreateLembagaGrades({
        lembagaId,
        category,
        gradeType,
        nilaiData: dataToSave,
      })

      if (result.success) {
        showToast(`Semua nilai ${categoryLabel} berhasil disimpan`, "success")
        window.location.reload()
      } else {
        showToast("Gagal menyimpan nilai", "error")
      }
    })
  }

  const handleDeleteGrade = async (nilaiId: string) => {
    startTransition(async () => {
      const result = await deleteLembagaGrade(nilaiId)

      if (result.success) {
        showToast("Nilai berhasil dihapus", "success")
        window.location.reload()
      } else {
        showToast("Gagal menghapus nilai", "error")
      }
    })
  }

  const hasChanges = santriList.some(santri => {
    const current = gradeData[santri.id]
    if (gradeType === "NUMERIC") {
      return current?.score !== santri.score
    } else {
      return current?.letterGrade !== santri.letterGrade
    }
  })

  const filledCount = santriList.filter(santri => {
    const current = gradeData[santri.id]
    if (gradeType === "NUMERIC") {
      return current?.score !== null && current?.score !== undefined
    } else {
      return current?.letterGrade !== null
    }
  }).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {filledCount} dari {santriList.length} santri sudah ada nilai {categoryLabel}
        </div>
        <Button 
          onClick={handleSaveAll}
          disabled={isPending || !hasChanges}
        >
          <Save className="h-4 w-4 mr-2" />
          Simpan Semua Nilai
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">No</TableHead>
              <TableHead>NIS</TableHead>
              <TableHead>Nama Santri</TableHead>
              <TableHead className="w-40">Nilai {categoryLabel}</TableHead>
              <TableHead className="w-24 text-center">Status</TableHead>
              <TableHead className="w-20 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {santriList.map((santri, index) => {
              const currentData = gradeData[santri.id]
              const hasGrade = gradeType === "NUMERIC" 
                ? (currentData?.score !== null && currentData?.score !== undefined)
                : currentData?.letterGrade !== null
              const isChanged = gradeType === "NUMERIC"
                ? currentData?.score !== santri.score
                : currentData?.letterGrade !== santri.letterGrade

              return (
                <TableRow key={santri.id} className={!hasGrade ? "bg-muted/30" : ""}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell className="font-mono text-sm">{santri.nis}</TableCell>
                  <TableCell className="font-medium">{santri.nama}</TableCell>
                  <TableCell>
                    {gradeType === "NUMERIC" ? (
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={currentData?.score ?? ""}
                        onChange={(e) => handleScoreChange(santri.id, e.target.value)}
                        placeholder="0-100"
                        className={`w-full ${getScoreColor(currentData?.score)}`}
                        disabled={isPending}
                      />
                    ) : (
                      <Select
                        value={currentData?.letterGrade || ""}
                        onValueChange={(value) => handleLetterGradeChange(santri.id, value)}
                        disabled={isPending}
                      >
                        <SelectTrigger className={`w-full ${getLetterGradeColor(currentData?.letterGrade)}`}>
                          <SelectValue placeholder="Pilih nilai" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CLEAR" className="text-muted-foreground">
                            <span className="italic">Kosongkan</span>
                          </SelectItem>
                          {LETTER_GRADES.map((grade) => (
                            <SelectItem 
                              key={grade} 
                              value={grade}
                              className={getLetterGradeColor(grade)}
                            >
                              {grade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {hasGrade ? (
                      <div className="flex items-center justify-center gap-1">
                        <Check className="h-4 w-4 text-green-600" />
                        {isChanged && (
                          <span className="text-xs text-orange-600">*</span>
                        )}
                      </div>
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {santri.nilaiId && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            disabled={isPending}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Nilai?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Apakah Anda yakin ingin menghapus nilai {categoryLabel} untuk {santri.nama}?
                              Tindakan ini tidak dapat dibatalkan.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteGrade(santri.nilaiId!)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {hasChanges && (
        <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
          <p className="text-sm text-orange-800 dark:text-orange-200">
            Ada perubahan yang belum disimpan
          </p>
          <Button 
            onClick={handleSaveAll}
            disabled={isPending}
            variant="default"
          >
            <Save className="h-4 w-4 mr-2" />
            Simpan Perubahan
          </Button>
        </div>
      )}
    </div>
  )
}

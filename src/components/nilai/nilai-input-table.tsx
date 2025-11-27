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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Save, Trash2, Check, X } from "lucide-react"
import { bulkCreateNilai, deleteNilai } from "@/actions/nilai-actions"
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

interface SantriNilai {
  id: string
  nis: string
  nama: string
  nilaiId: string | null
  score: number | null
}

interface NilaiInputTableProps {
  ujianId: string
  mapelId: string
  santriList: SantriNilai[]
}

export function NilaiInputTable({ ujianId, mapelId, santriList }: NilaiInputTableProps) {
  const [nilaiData, setNilaiData] = useState<Record<string, number | null>>(
    santriList.reduce((acc, santri) => ({
      ...acc,
      [santri.id]: santri.score
    }), {})
  )
  const [isPending, startTransition] = useTransition()
  const { showToast } = useToast()

  const handleScoreChange = (santriId: string, value: string) => {
    const numValue = value === "" ? null : parseFloat(value)
    
    // Validate range
    if (numValue !== null && (numValue < 0 || numValue > 100)) {
      showToast("Nilai harus antara 0 dan 100", "error")
      return
    }

    setNilaiData(prev => ({
      ...prev,
      [santriId]: numValue
    }))
  }

  const handleSaveAll = () => {
    startTransition(async () => {
      const dataToSave = santriList.map(santri => ({
        santriId: santri.id,
        score: nilaiData[santri.id] ?? 0,
        nilaiId: santri.nilaiId,
      })).filter(item => item.score !== null)

      const result = await bulkCreateNilai({
        ujianId,
        mapelId,
        nilaiData: dataToSave,
      })

      if (result.success) {
        showToast("Semua nilai berhasil disimpan", "success")
        // Refresh page
        window.location.reload()
      } else {
        showToast("Gagal menyimpan nilai", "error")
      }
    })
  }

  const handleDeleteNilai = async (nilaiId: string) => {
    startTransition(async () => {
      const result = await deleteNilai(nilaiId)

      if (result.success) {
        showToast("Nilai berhasil dihapus", "success")
        // Refresh page
        window.location.reload()
      } else {
        showToast("Gagal menghapus nilai", "error")
      }
    })
  }

  const getScoreColor = (score: number | null) => {
    if (score === null) return ""
    if (score >= 90) return "text-green-600 dark:text-green-400 font-bold"
    if (score >= 75) return "text-blue-600 dark:text-blue-400 font-bold"
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400 font-bold"
    return "text-red-600 dark:text-red-400 font-bold"
  }

  const hasChanges = santriList.some(santri => 
    nilaiData[santri.id] !== santri.score
  )

  const filledCount = Object.values(nilaiData).filter(v => v !== null).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {filledCount} dari {santriList.length} santri sudah ada nilai
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
              <TableHead className="w-32">Nilai</TableHead>
              <TableHead className="w-24 text-center">Status</TableHead>
              <TableHead className="w-20 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {santriList.map((santri, index) => {
              const currentScore = nilaiData[santri.id]
              const hasScore = currentScore !== null
              const isChanged = currentScore !== santri.score

              return (
                <TableRow key={santri.id} className={!hasScore ? "bg-muted/30" : ""}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell className="font-mono text-sm">{santri.nis}</TableCell>
                  <TableCell className="font-medium">{santri.nama}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={currentScore ?? ""}
                      onChange={(e) => handleScoreChange(santri.id, e.target.value)}
                      placeholder="0-100"
                      className={`w-full ${getScoreColor(currentScore)}`}
                      disabled={isPending}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    {hasScore ? (
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
                              Apakah Anda yakin ingin menghapus nilai untuk {santri.nama}?
                              Tindakan ini tidak dapat dibatalkan.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteNilai(santri.nilaiId!)}
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

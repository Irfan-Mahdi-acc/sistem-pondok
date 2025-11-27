"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Play, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { activateSemester } from "@/actions/semester-actions"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface GlobalStartSemesterButtonProps {
  lembagaList: Array<{ id: string; name: string; jenjang?: string | null }>
  academicYears: Array<{ id: string; name: string; isActive: boolean }>
}

export function GlobalStartSemesterButton({
  lembagaList,
  academicYears,
}: GlobalStartSemesterButtonProps) {
  const [open, setOpen] = useState(false)
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string>("")
  const [selectedSemester, setSelectedSemester] = useState<"1" | "2">("1")
  const [isPending, startTransition] = useTransition()
  const [results, setResults] = useState<Array<{ lembaga: string; success: boolean; message: string }>>([])
  const [showResults, setShowResults] = useState(false)
  const router = useRouter()

  // Get active academic year as default
  const activeYear = academicYears.find(y => y.isActive)
  const defaultAcademicYearId = activeYear?.id || academicYears[0]?.id

  const handleStart = async () => {
    if (!selectedAcademicYearId) return

    setShowResults(false)
    setResults([])

    startTransition(async () => {
      const activationResults: Array<{ lembaga: string; success: boolean; message: string }> = []

      // Activate semester for each lembaga
      for (const lembaga of lembagaList) {
        try {
          const result = await activateSemester({
            lembagaId: lembaga.id,
            academicYearId: selectedAcademicYearId,
            semester: selectedSemester,
          })

          activationResults.push({
            lembaga: lembaga.name,
            success: result.success,
            message: result.success ? result.message || "Berhasil" : result.error || "Gagal",
          })
        } catch (error) {
          activationResults.push({
            lembaga: lembaga.name,
            success: false,
            message: "Terjadi kesalahan",
          })
        }
      }

      setResults(activationResults)
      setShowResults(true)

      // Refresh after a delay if all successful
      const allSuccess = activationResults.every(r => r.success)
      if (allSuccess) {
        setTimeout(() => {
          setOpen(false)
          setShowResults(false)
          router.refresh()
        }, 2000)
      }
    })
  }

  const selectedYear = academicYears.find(y => y.id === selectedAcademicYearId)
  const successCount = results.filter(r => r.success).length
  const failCount = results.filter(r => !r.success).length

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">
          <Play className="h-4 w-4 mr-2" />
          Memulai Sesi Input Nilai
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Memulai Sesi Input Nilai</DialogTitle>
          <DialogDescription>
            Aktifkan semester untuk semua lembaga sekaligus agar dapat mulai menginput nilai
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!showResults ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">Tahun Akademik</label>
                  <Select
                    value={selectedAcademicYearId || defaultAcademicYearId}
                    onValueChange={setSelectedAcademicYearId}
                    disabled={isPending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Tahun Akademik" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicYears.map((year) => (
                        <SelectItem key={year.id} value={year.id}>
                          {year.name} {year.isActive && "(Aktif)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Semester</label>
                  <Select
                    value={selectedSemester}
                    onValueChange={(value) => setSelectedSemester(value as "1" | "2")}
                    disabled={isPending}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Semester 1</SelectItem>
                      <SelectItem value="2">Semester 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Lembaga yang akan diaktifkan:</h4>
                      <Badge variant="secondary">{lembagaList.length} lembaga</Badge>
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-1 text-sm text-muted-foreground">
                      {lembagaList.map((lembaga) => (
                        <div key={lembaga.id} className="flex items-center justify-between py-1">
                          <span>{lembaga.name}</span>
                          <span className="text-xs">{lembaga.jenjang}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 dark:text-blue-100">Informasi</p>
                    <p className="text-blue-700 dark:text-blue-300 mt-1">
                      Dengan memulai sesi input nilai, semua lembaga akan dapat menginput nilai ujian mapel,
                      non-mapel, dan hifdz untuk semester {selectedSemester}.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Hasil Aktivasi</h4>
                <div className="flex gap-2">
                  {successCount > 0 && (
                    <Badge variant="default" className="bg-green-600">
                      {successCount} Berhasil
                    </Badge>
                  )}
                  {failCount > 0 && (
                    <Badge variant="destructive">{failCount} Gagal</Badge>
                  )}
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-2 p-3 rounded-lg border ${
                      result.success
                        ? "bg-green-50 dark:bg-green-950 border-green-200"
                        : "bg-red-50 dark:bg-red-950 border-red-200"
                    }`}
                  >
                    {result.success ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1 text-sm">
                      <p className="font-medium">{result.lembaga}</p>
                      <p className="text-muted-foreground text-xs mt-0.5">{result.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {!showResults ? (
            <>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
                Batal
              </Button>
              <Button onClick={handleStart} disabled={isPending || !selectedAcademicYearId}>
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Mulai Sesi Input Nilai"
                )}
              </Button>
            </>
          ) : (
            <Button onClick={() => setOpen(false)} disabled={isPending}>
              Tutup
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

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
import { Play, AlertCircle, CheckCircle2, Database } from "lucide-react"
import { activateSemester, migrateDataToSemester } from "@/actions/semester-actions"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"

// Simple Alert component
function Alert({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border p-4 ${className}`}>
      {children}
    </div>
  )
}

function AlertTitle({ children }: { children: React.ReactNode }) {
  return <h5 className="mb-1 font-medium leading-none tracking-tight">{children}</h5>
}

function AlertDescription({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`text-sm [&_p]:leading-relaxed ${className}`}>{children}</div>
}

interface StartSemesterButtonProps {
  lembagaId: string
  academicYearId: string
  academicYearName: string
  semester: "1" | "2"
  isActive: boolean
  oldDataCount?: number
}

export function StartSemesterButton({
  lembagaId,
  academicYearId,
  academicYearName,
  semester,
  isActive,
  oldDataCount = 0
}: StartSemesterButtonProps) {
  const [open, setOpen] = useState(false)
  const [migrateOldData, setMigrateOldData] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  const handleStart = async () => {
    setError(null)
    setSuccess(null)
    
    startTransition(async () => {
      try {
        // Migrate old data if checkbox is checked
        if (migrateOldData && oldDataCount > 0) {
          const migrateResult = await migrateDataToSemester({
            lembagaId,
            academicYearId,
            semester,
            dataType: "all"
          })

          if (!migrateResult.success) {
            setError(migrateResult.error || "Gagal memigrasikan data")
            return
          }

          setSuccess(migrateResult.message || `${migrateResult.updatedCount} data berhasil dimigrasikan`)
        }

        // Activate semester
        const result = await activateSemester({
          lembagaId,
          academicYearId,
          semester
        })

        if (result.success) {
          setSuccess(result.message || "Semester berhasil diaktifkan")
          setTimeout(() => {
            setOpen(false)
            router.refresh()
          }, 1500)
        } else {
          setError(result.error || "Gagal mengaktifkan semester")
        }
      } catch (error) {
        console.error("Error starting semester:", error)
        setError("Terjadi kesalahan saat memulai semester")
      }
    })
  }

  if (isActive) {
    return (
      <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertTitle>Semester Aktif</AlertTitle>
        <AlertDescription>
          Semester {semester} sudah aktif dan siap digunakan
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="lg" className="w-full">
          <Play className="h-4 w-4 mr-2" />
          Memulai Sesi Input Nilai - Semester {semester}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Memulai Sesi Input Nilai - Semester {semester}</DialogTitle>
          <DialogDescription>
            Mulai sesi input nilai untuk semester {semester} tahun akademik {academicYearName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert className="border-red-200 bg-red-50 dark:bg-red-950">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>Berhasil</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Informasi</AlertTitle>
            <AlertDescription>
              Dengan memulai sesi input nilai, Anda dapat menginput nilai ujian mapel, 
              non-mapel, dan hifdz untuk semester {semester}.
            </AlertDescription>
          </Alert>

          {oldDataCount > 0 && (
            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
              <Database className="h-4 w-4 text-blue-600" />
              <AlertTitle>Data Lama Ditemukan</AlertTitle>
              <AlertDescription className="space-y-3">
                <p>
                  Ditemukan {oldDataCount} data nilai/ujian yang belum memiliki semester.
                </p>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="migrate"
                    checked={migrateOldData}
                    onCheckedChange={(checked) => setMigrateOldData(checked as boolean)}
                  />
                  <label
                    htmlFor="migrate"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Migrasikan data lama ke semester {semester}
                  </label>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Batal
          </Button>
          <Button onClick={handleStart} disabled={isPending}>
            {isPending ? "Memproses..." : "Mulai Sesi Input Nilai"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

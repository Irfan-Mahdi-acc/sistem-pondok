'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { createUjianHifdzRecord } from "@/actions/ujian-hifdz-actions"
import { useToast } from "@/components/ui/toast"
import { Plus } from "lucide-react"
import { format } from "date-fns"
import { JUZ_LIST, SURAH_LIST } from "@/lib/quran-data"

interface AddSingleExamFormProps {
  santriId: string
  santriName: string
  ustadzList: any[]
}

export function AddSingleExamForm({ santriId, santriName, ustadzList }: AddSingleExamFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const { showToast } = useToast()
  const router = useRouter()

  const [examType, setExamType] = useState<"JUZ" | "SURAH">("JUZ")
  const [juz, setJuz] = useState("")
  const [startSurah, setStartSurah] = useState("")
  const [startAyat, setStartAyat] = useState("1")
  const [endSurah, setEndSurah] = useState("")
  const [endAyat, setEndAyat] = useState("1")
  const [ustadzId, setUstadzId] = useState("")
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"))

  async function handleSave() {
    // Validate required fields
    if (examType === "JUZ" && !juz) {
      showToast("Pilih Juz terlebih dahulu", "error")
      return
    }
    
    if (examType === "SURAH") {
      if (!startSurah || !startAyat || !endSurah || !endAyat) {
        showToast("Lengkapi data surah dan ayat", "error")
        return
      }
    }

    setIsPending(true)

    try {
      const formData = new FormData()
      
      formData.append("santriId", santriId)
      
      if (examType === "JUZ") {
        // Get Juz details
        const juzDetail = JUZ_LIST.find(j => j.value === juz)
        if (juzDetail) {
          // Use surah range format
          if (juzDetail.startSurah === juzDetail.endSurah) {
            formData.append("surah", juzDetail.startSurah)
            formData.append("ayatStart", juzDetail.startAyat.toString())
            formData.append("ayatEnd", juzDetail.endAyat.toString())
          } else {
            formData.append("surah", `${juzDetail.startSurah}:${juzDetail.startAyat} - ${juzDetail.endSurah}:${juzDetail.endAyat}`)
            formData.append("ayatStart", "0")
            formData.append("ayatEnd", "0")
          }
        }
      } else {
        if (startSurah === endSurah) {
          formData.append("surah", startSurah)
          formData.append("ayatStart", startAyat)
          formData.append("ayatEnd", endAyat)
        } else {
          formData.append("surah", `${startSurah}:${startAyat} - ${endSurah}:${endAyat}`)
          formData.append("ayatStart", "0")
          formData.append("ayatEnd", "0")
        }
      }

      if (ustadzId) formData.append("ustadzId", ustadzId)
      formData.append("date", date)

      const result = await createUjianHifdzRecord(formData)

      if (result.success) {
        showToast("Ujian berhasil ditambahkan", "success")
        setIsOpen(false)
        // Reset form
        setExamType("JUZ")
        setJuz("")
        setStartSurah("")
        setStartAyat("1")
        setEndSurah("")
        setEndAyat("1")
        setUstadzId("")
        setDate(format(new Date(), "yyyy-MM-dd"))
        router.refresh()
      } else {
        showToast(result.error as string, "error")
      }
    } catch (error) {
      showToast("Terjadi kesalahan", "error")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-1" />
          Tambah Ujian
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Ujian untuk {santriName}</DialogTitle>
          <DialogDescription>
            Tambahkan ujian baru. Nilai dapat diisi nanti.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Date */}
          <div className="space-y-2">
            <Label>Tanggal Ujian</Label>
            <Input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Examiner */}
          <div className="space-y-2">
            <Label>Penguji (Opsional)</Label>
            <Select value={ustadzId} onValueChange={setUstadzId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Penguji" />
              </SelectTrigger>
              <SelectContent>
                {ustadzList.map((ustadz) => (
                  <SelectItem key={ustadz.id} value={ustadz.id}>
                    {ustadz.user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Exam Type */}
          <div className="space-y-2">
            <Label>Tipe Ujian</Label>
            <RadioGroup
              value={examType}
              onValueChange={(value: "JUZ" | "SURAH") => setExamType(value)}
              className="flex flex-row space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="JUZ" id="juz" />
                <Label htmlFor="juz" className="font-normal">Per Juz</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="SURAH" id="surah" />
                <Label htmlFor="surah" className="font-normal">Per Surah</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Conditional Fields */}
          {examType === "JUZ" ? (
            <div className="space-y-2">
              <Label>Pilih Juz</Label>
              <Select value={juz} onValueChange={setJuz}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Juz" />
                </SelectTrigger>
                <SelectContent>
                  {JUZ_LIST.map((j) => (
                    <SelectItem key={j.value} value={j.value}>
                      {j.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-4 border p-4 rounded-md">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Dari Surah</Label>
                  <Select value={startSurah} onValueChange={setStartSurah}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih" />
                    </SelectTrigger>
                    <SelectContent>
                      {SURAH_LIST.map((s) => (
                        <SelectItem key={s.number} value={s.name}>
                          {s.number}. {s.name} ({s.ayatCount} ayat)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ayat Mulai</Label>
                  <Input 
                    type="number" 
                    min="1"
                    value={startAyat}
                    onChange={(e) => setStartAyat(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sampai Surah</Label>
                  <Select value={endSurah} onValueChange={setEndSurah}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih" />
                    </SelectTrigger>
                    <SelectContent>
                      {SURAH_LIST.map((s) => (
                        <SelectItem key={s.number} value={s.name}>
                          {s.number}. {s.name} ({s.ayatCount} ayat)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ayat Selesai</Label>
                  <Input 
                    type="number" 
                    min="1"
                    value={endAyat}
                    onChange={(e) => setEndAyat(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

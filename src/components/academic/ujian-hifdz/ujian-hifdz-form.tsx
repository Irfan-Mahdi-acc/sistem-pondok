'use client'

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { createUjianHifdzRecord, updateUjianHifdzRecord } from "@/actions/ujian-hifdz-actions"
import { useToast } from "@/components/ui/toast"
import { Plus } from "lucide-react"
import { format } from "date-fns"
import { JUZ_LIST, SURAH_LIST } from "@/lib/quran-data"

const formSchema = z.object({
  santriId: z.string().min(1, "Santri harus dipilih"),
  ustadzId: z.string().optional(),
  examType: z.enum(["JUZ", "SURAH"]),
  juz: z.string().optional(),
  startSurah: z.string().optional(),
  startAyat: z.string().optional(),
  endSurah: z.string().optional(),
  endAyat: z.string().optional(),
  grade: z.string().optional(), // Nilai opsional, bisa diisi nanti
  note: z.string().optional(),
  date: z.string().optional(),
}).refine((data) => {
  if (data.examType === "JUZ") {
    return !!data.juz
  }
  return !!data.startSurah && !!data.startAyat && !!data.endSurah && !!data.endAyat
}, {
  message: "Mohon lengkapi data hafalan",
  path: ["examType"],
})

interface UjianHifdzFormProps {
  santriList: any[]
  ustadzList: any[]
  record?: any
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function UjianHifdzForm({ 
  santriList, 
  ustadzList, 
  record,
  open,
  onOpenChange 
}: UjianHifdzFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const { showToast } = useToast()

  const getInitialValues = () => {
    if (!record) {
      return {
        santriId: "",
        ustadzId: "",
        examType: "JUZ" as const,
        juz: "",
        startSurah: "",
        startAyat: "1",
        endSurah: "",
        endAyat: "1",
        grade: "",
        note: "",
        date: format(new Date(), "yyyy-MM-dd"),
      }
    }

    const isJuz = record.surah.startsWith("Juz")
    let juz = ""
    let startSurah = ""
    let endSurah = ""
    let startAyat = record.ayatStart.toString()
    let endAyat = record.ayatEnd.toString()

    if (isJuz) {
      juz = record.surah.replace("Juz ", "")
    } else {
      if (record.surah.includes(" - ")) {
        const parts = record.surah.split(" - ")
        const startParts = parts[0].split(":")
        const endParts = parts[1].split(":")
        startSurah = startParts[0]
        startAyat = startParts[1] || record.ayatStart.toString()
        endSurah = endParts[0]
        endAyat = endParts[1] || record.ayatEnd.toString()
      } else {
        startSurah = record.surah
        endSurah = record.surah
      }
    }

    return {
      santriId: record.santriId,
      ustadzId: record.ustadzId || "",
      examType: (isJuz ? "JUZ" : "SURAH") as "JUZ" | "SURAH",
      juz,
      startSurah,
      startAyat,
      endSurah,
      endAyat,
      grade: record.grade || "",
      note: record.note || "",
      date: record.date ? format(new Date(record.date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
    }
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: getInitialValues(),
  })

  useEffect(() => {
    if (open || isOpen) {
      form.reset(getInitialValues())
    }
  }, [record, open, isOpen])

  const examType = form.watch("examType")

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsPending(true)
    const formData = new FormData()
    
    formData.append("santriId", values.santriId)
    if (values.ustadzId) formData.append("ustadzId", values.ustadzId)
    if (values.grade) formData.append("grade", values.grade) // Nilai opsional
    if (values.note) formData.append("note", values.note)
    if (values.date) formData.append("date", values.date)

    if (values.examType === "JUZ") {
      formData.append("surah", `Juz ${values.juz}`)
      formData.append("ayatStart", "1")
      formData.append("ayatEnd", "1")
    } else {
      if (values.startSurah === values.endSurah) {
        formData.append("surah", values.startSurah!)
        formData.append("ayatStart", values.startAyat!)
        formData.append("ayatEnd", values.endAyat!)
      } else {
        const surahString = `${values.startSurah}:${values.startAyat} - ${values.endSurah}:${values.endAyat}`
        formData.append("surah", surahString)
        formData.append("ayatStart", "0")
        formData.append("ayatEnd", "0")
      }
    }

    try {
      if (record) {
        const result = await updateUjianHifdzRecord(record.id, formData)
        if (result.success) {
          showToast("Data ujian berhasil diperbarui", "success")
          onOpenChange?.(false)
        } else {
          showToast(result.error as string, "error")
        }
      } else {
        const result = await createUjianHifdzRecord(formData)
        if (result.success) {
          showToast("Data ujian berhasil ditambahkan", "success")
          setIsOpen(false)
          form.reset()
        } else {
          showToast(result.error as string, "error")
        }
      }
    } catch (error) {
      showToast("Terjadi kesalahan", "error")
    } finally {
      setIsPending(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  const trigger = !record ? (
    <Button onClick={() => setIsOpen(true)}>
      <Plus className="mr-2 h-4 w-4" />
      Tambah Ujian
    </Button>
  ) : null

  return (
    <Dialog open={open !== undefined ? open : isOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{record ? "Edit Data Ujian" : "Tambah Data Ujian"}</DialogTitle>
          <DialogDescription>
            {record 
              ? "Edit data ujian dan isi nilai setelah ujian dilaksanakan."
              : "Buat jadwal ujian untuk santri. Nilai dapat diisi nanti setelah ujian dilaksanakan."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="santriId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Santri</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Santri" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {santriList.map((santri) => (
                        <SelectItem key={santri.id} value={santri.id}>
                          {santri.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ustadzId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Penguji (Opsional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Penguji" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ustadzList.map((ustadz) => (
                        <SelectItem key={ustadz.id} value={ustadz.id}>
                          {ustadz.user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="examType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Tipe Ujian</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-row space-x-4"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="JUZ" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Per Juz
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="SURAH" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Per Surah
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {examType === "JUZ" ? (
              <FormField
                control={form.control}
                name="juz"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pilih Juz</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Juz" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {JUZ_LIST.map((juz) => (
                          <SelectItem key={juz.value} value={juz.value}>
                            {juz.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <div className="space-y-4 border p-4 rounded-md">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startSurah"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dari Surah</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih Surah" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SURAH_LIST.map((surah) => (
                              <SelectItem key={surah.number} value={surah.name}>
                                {surah.number}. {surah.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="startAyat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ayat Mulai</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="endSurah"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sampai Surah</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih Surah" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SURAH_LIST.map((surah) => (
                              <SelectItem key={surah.number} value={surah.name}>
                                {surah.number}. {surah.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endAyat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ayat Selesai</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="grade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nilai / Predikat (Opsional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Belum dinilai - Isi setelah ujian" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="A">Mumtaz (A)</SelectItem>
                      <SelectItem value="B">Jayyid Jiddan (B)</SelectItem>
                      <SelectItem value="C">Jayyid (C)</SelectItem>
                      <SelectItem value="D">Maqbul (D)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan Penguji (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Catatan tentang kelancaran, tajwid, atau hal lain yang perlu dicatat..."
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

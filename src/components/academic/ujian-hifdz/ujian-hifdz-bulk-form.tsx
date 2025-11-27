'use client'

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
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
import { createBulkUjianHifdz } from "@/actions/ujian-hifdz-actions"
import { useToast } from "@/components/ui/toast"
import { Plus, Trash2, Users } from "lucide-react"
import { format } from "date-fns"
import { JUZ_LIST, SURAH_LIST } from "@/lib/quran-data"

const examSchema = z.object({
  examType: z.enum(["JUZ", "SURAH"]),
  juz: z.string().optional(),
  startSurah: z.string().optional(),
  startAyat: z.string().optional(),
  endSurah: z.string().optional(),
  endAyat: z.string().optional(),
  ustadzId: z.string().optional(),
}).refine((data) => {
  if (data.examType === "JUZ") {
    return !!data.juz
  }
  return !!data.startSurah && !!data.startAyat && !!data.endSurah && !!data.endAyat
}, {
  message: "Mohon lengkapi data hafalan",
})

const formSchema = z.object({
  santriId: z.string().min(1, "Santri harus dipilih"),
  date: z.string().min(1, "Tanggal harus diisi"),
  examinerMode: z.enum(["same", "different"]),
  globalUstadzId: z.string().optional(),
  exams: z.array(examSchema).min(1, "Minimal 1 ujian harus ditambahkan"),
})

interface BulkFormProps {
  santriList: any[]
  ustadzList: any[]
}

export function UjianHifdzBulkForm({ santriList, ustadzList }: BulkFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const { showToast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      santriId: "",
      date: format(new Date(), "yyyy-MM-dd"),
      examinerMode: "same",
      globalUstadzId: "",
      exams: [
        {
          examType: "JUZ",
          juz: "",
          startSurah: "",
          startAyat: "1",
          endSurah: "",
          endAyat: "1",
          ustadzId: "",
        }
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "exams",
  })

  const examinerMode = form.watch("examinerMode")

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsPending(true)

    try {
      const examsData = values.exams.map(exam => {
        let examData: any = { ...exam }
        
        // If Juz mode, get the Juz details
        if (exam.examType === 'JUZ' && exam.juz) {
          const juzDetail = JUZ_LIST.find(j => j.value === exam.juz)
          if (juzDetail) {
            examData.startSurah = juzDetail.startSurah
            examData.startAyat = juzDetail.startAyat.toString()
            examData.endSurah = juzDetail.endSurah
            examData.endAyat = juzDetail.endAyat.toString()
          }
        }
        
        examData.ustadzId = examinerMode === "same" ? values.globalUstadzId : exam.ustadzId
        return examData
      })

      const result = await createBulkUjianHifdz({
        santriId: values.santriId,
        date: values.date,
        exams: examsData,
      })

      if (result.success) {
        showToast(result.message || "Ujian berhasil ditambahkan", "success")
        setIsOpen(false)
        form.reset()
      } else {
        showToast(result.error as string, "error")
      }
    } catch (error) {
      showToast("Terjadi kesalahan", "error")
    } finally {
      setIsPending(false)
    }
  }

  const addExam = () => {
    append({
      examType: "JUZ",
      juz: "",
      startSurah: "",
      startAyat: "1",
      endSurah: "",
      endAyat: "1",
      ustadzId: "",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Ujian
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Ujian</DialogTitle>
          <DialogDescription>
            Tambahkan beberapa ujian sekaligus untuk satu santri. Nilai dapat diisi nanti.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Santri Selection */}
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

            {/* Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Ujian</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Examiner Mode */}
            <FormField
              control={form.control}
              name="examinerMode"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Mode Penguji</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="same" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Penguji sama untuk semua ujian
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="different" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Penguji berbeda per ujian
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Global Examiner (if same mode) */}
            {examinerMode === "same" && (
              <FormField
                control={form.control}
                name="globalUstadzId"
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
            )}

            {/* Exams List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Daftar Ujian ({fields.length})</FormLabel>
                <Button type="button" variant="outline" size="sm" onClick={addExam}>
                  <Plus className="h-4 w-4 mr-1" />
                  Tambah Ujian
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Ujian {index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>

                  {/* Exam Type */}
                  <FormField
                    control={form.control}
                    name={`exams.${index}.examType`}
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Tipe</FormLabel>
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
                              <FormLabel className="font-normal">Juz</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="SURAH" />
                              </FormControl>
                              <FormLabel className="font-normal">Surah</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Conditional Fields */}
                  {form.watch(`exams.${index}.examType`) === "JUZ" ? (
                    <FormField
                      control={form.control}
                      name={`exams.${index}.juz`}
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
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`exams.${index}.startSurah`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dari Surah</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {SURAH_LIST.map((surah) => (
                                  <SelectItem key={surah.number} value={surah.name}>
                                    {surah.number}. {surah.name} ({surah.ayatCount} ayat)
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
                        name={`exams.${index}.startAyat`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ayat</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`exams.${index}.endSurah`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sampai Surah</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {SURAH_LIST.map((surah) => (
                                  <SelectItem key={surah.number} value={surah.name}>
                                    {surah.number}. {surah.name} ({surah.ayatCount} ayat)
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
                        name={`exams.${index}.endAyat`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ayat</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Individual Examiner (if different mode) */}
                  {examinerMode === "different" && (
                    <FormField
                      control={form.control}
                      name={`exams.${index}.ustadzId`}
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
                  )}
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Menyimpan..." : `Simpan ${fields.length} Ujian`}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

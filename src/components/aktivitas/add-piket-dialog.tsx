'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { createPiketSchedule } from "@/actions/piket-actions"
import { useToast } from "@/components/ui/toast"

const formSchema = z.object({
  santriId: z.string().min(1, "Santri harus dipilih"),
  day: z.string().min(1, "Hari harus dipilih"),
  area: z.string().optional(),
  role: z.string().optional(),
})

const DAYS = ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU", "AHAD"]

type AddPiketDialogProps = {
  type: "ASRAMA" | "KELAS" | "AREA"
  locationId: string
  santriList: any[]
  onSuccess: (data: any) => void
}

export function AddPiketDialog({ type, locationId, santriList, onSuccess }: AddPiketDialogProps) {
  const [open, setOpen] = useState(false)
  const toast = useToast()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      area: "",
      role: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const result = await createPiketSchedule({
      ...values,
      type,
      locationId
    })

    if (result.success) {
      toast.showToast("Jadwal piket berhasil ditambahkan", "success")
      setOpen(false)
      form.reset()
      onSuccess(result.data)
    } else {
      toast.showToast(result.error || "Gagal menambahkan jadwal", "error")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Petugas
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Petugas Piket</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField
              control={form.control}
              name="santriId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Santri</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? santriList.find(
                                (santri) => santri.id === field.value
                              )?.nama
                            : "Pilih Santri"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput placeholder="Cari nama santri..." />
                        <CommandList>
                          <CommandEmpty>Santri tidak ditemukan.</CommandEmpty>
                          <CommandGroup>
                            {santriList.map((santri) => (
                              <CommandItem
                                value={santri.nama}
                                key={santri.id}
                                onSelect={() => {
                                  form.setValue("santriId", santri.id)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    santri.id === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {santri.nama}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="day"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hari</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Hari" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DAYS.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
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
              name="area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Area / Tugas (Opsional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Halaman, Kamar Mandi..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">Simpan</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

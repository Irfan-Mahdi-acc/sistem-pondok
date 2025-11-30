'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { createPSBPeriod, updatePSBPeriod } from "@/actions/psb-actions"
import { toast } from "sonner"

const formSchema = z.object({
  name: z.string().min(1, "Nama gelombang wajib diisi"),
  description: z.string().optional(),
  startDate: z.string().min(1, "Tanggal mulai wajib diisi"),
  endDate: z.string().min(1, "Tanggal selesai wajib diisi"),
  isActive: z.boolean().default(false),
  quota: z.coerce.number().optional(),
  registrationFee: z.coerce.number().min(0).default(0),
})

interface PeriodDialogProps {
  period?: any
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function PeriodDialog({ period, trigger, open, onOpenChange }: PeriodDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const isEdit = !!period

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: period?.name || "",
      description: period?.description || "",
      startDate: period?.startDate ? new Date(period.startDate).toISOString().split('T')[0] : "",
      endDate: period?.endDate ? new Date(period.endDate).toISOString().split('T')[0] : "",
      isActive: period?.isActive || false,
      quota: period?.quota || undefined,
      registrationFee: period?.registrationFee || 0,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (isEdit) {
        const result = await updatePSBPeriod(period.id, values)
        if (result.success) {
          toast.success("Gelombang berhasil diperbarui")
          setIsOpen(false)
          onOpenChange?.(false)
        } else {
          toast.error(result.error)
        }
      } else {
        const result = await createPSBPeriod(values)
        if (result.success) {
          toast.success("Gelombang berhasil dibuat")
          setIsOpen(false)
          onOpenChange?.(false)
          form.reset()
        } else {
          toast.error(result.error)
        }
      }
    } catch (error) {
      toast.error("Terjadi kesalahan")
    }
  }

  return (
    <Dialog open={open ?? isOpen} onOpenChange={onOpenChange ?? setIsOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Tambah Gelombang</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Gelombang" : "Tambah Gelombang"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Edit detail gelombang pendaftaran." : "Buat gelombang pendaftaran baru."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Gelombang</FormLabel>
                  <FormControl>
                    <Input placeholder="Gelombang 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Deskripsi singkat..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Mulai</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Selesai</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quota"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kuota (Opsional)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="registrationFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biaya Pendaftaran</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Aktif</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">{isEdit ? "Simpan" : "Buat"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { useState, useEffect } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { FeeBreakdownInput } from "./fee-breakdown-input"
import { createPSBPeriod, updatePSBPeriod } from "@/actions/psb-actions"
import { toast } from "sonner"

const formSchema = z.object({
  name: z.string().min(1, "Nama gelombang wajib diisi"),
  description: z.string().optional(),
  startDate: z.string().min(1, "Tanggal mulai wajib diisi"),
  endDate: z.string().min(1, "Tanggal selesai wajib diisi"),
  isActive: z.boolean(),
  quota: z.number().optional(),
  lembagaId: z.string().min(1, "Lembaga wajib dipilih"),
  registrationFeeDetails: z.record(z.string(), z.number()).optional(),
  reregistrationFeeDetails: z.record(z.string(), z.number()).optional(),
})

interface PeriodDialogProps {
  period?: any
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  lembagas: Array<{ id: string; name: string }>
}

export function PeriodDialog({ period, trigger, open, onOpenChange, lembagas }: PeriodDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const isEdit = !!period

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: period?.name || "",
      description: period?.description || "",
      startDate: period?.startDate ? new Date(period.startDate).toISOString().split('T')[0] : "",
      endDate: period?.endDate ? new Date(period.endDate).toISOString().split('T')[0] : "",
      isActive: period?.isActive ?? false,
      quota: period?.quota ? Number(period.quota) : undefined,
      lembagaId: period?.lembagaId || "",
      registrationFeeDetails: period?.registrationFeeDetails || {},
      reregistrationFeeDetails: period?.reregistrationFeeDetails || {},
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
          form.reset()
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

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen)
    onOpenChange?.(newOpen)
    if (!newOpen) {
      form.reset()
    }
  }

  return (
    <Dialog open={open ?? isOpen} onOpenChange={handleOpenChange}>
      {trigger}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Gelombang" : "Tambah Gelombang"}</DialogTitle>
          <DialogDescription>
            Buat gelombang pendaftaran baru dengan rincian biaya.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
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
                name="lembagaId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lembaga</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih lembaga" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {lembagas.map((lembaga) => (
                          <SelectItem key={lembaga.id} value={lembaga.id}>
                            {lembaga.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Deskripsi singkat..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
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

              <FormField
                control={form.control}
                name="quota"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kuota (Opsional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="100"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        value={field.value || ''}
                      />
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
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Aktif</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Gelombang ini akan ditampilkan di portal publik
                    </div>
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

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Rincian Biaya</h3>
              
              <FormField
                control={form.control}
                name="registrationFeeDetails"
                render={({ field }) => (
                  <FormItem>
                    <FeeBreakdownInput
                      title="Biaya Pendaftaran"
                      description="Rincian biaya yang harus dibayar saat pendaftaran"
                      value={field.value || {}}
                      onChange={field.onChange}
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reregistrationFeeDetails"
                render={({ field }) => (
                  <FormItem>
                    <FeeBreakdownInput
                      title="Biaya Daftar Ulang"
                      description="Rincian biaya yang harus dibayar setelah diterima"
                      value={field.value || {}}
                      onChange={field.onChange}
                    />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Batal
              </Button>
              <Button type="submit">
                {isEdit ? "Simpan" : "Buat"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

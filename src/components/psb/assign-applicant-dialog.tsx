'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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
import { Button } from "@/components/ui/button"
import { assignApplicant } from "@/actions/psb-actions"
import { toast } from "sonner"

const formSchema = z.object({
  lembagaId: z.string().min(1, "Lembaga wajib dipilih"),
  kelasId: z.string().min(1, "Kelas wajib dipilih"),
})

interface AssignApplicantDialogProps {
  registration: any
  lembagas: Array<{ id: string; name: string }>
  allKelas: Array<{ id: string; name: string; lembagaId: string }>
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AssignApplicantDialog({
  registration,
  lembagas,
  allKelas,
  open,
  onOpenChange,
}: AssignApplicantDialogProps) {
  const [selectedLembagaId, setSelectedLembagaId] = useState<string>("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lembagaId: registration?.assignedLembagaId || "",
      kelasId: registration?.assignedKelasId || "",
    },
  })

  const filteredKelas = allKelas.filter(
    (kelas) => kelas.lembagaId === selectedLembagaId
  )

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const result = await assignApplicant(
        registration.id,
        values.lembagaId,
        values.kelasId
      )
      
      if (result.success) {
        toast.success("Pendaftar berhasil di-assign")
        onOpenChange(false)
        form.reset()
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error("Terjadi kesalahan")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Pendaftar</DialogTitle>
          <DialogDescription>
            Tentukan lembaga dan kelas untuk {registration?.name}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="lembagaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lembaga</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value)
                      setSelectedLembagaId(value)
                      form.setValue("kelasId", "") // Reset kelas
                    }}
                    value={field.value}
                  >
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

            <FormField
              control={form.control}
              name="kelasId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kelas</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!selectedLembagaId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kelas" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredKelas.map((kelas) => (
                        <SelectItem key={kelas.id} value={kelas.id}>
                          {kelas.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button type="submit">Assign</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

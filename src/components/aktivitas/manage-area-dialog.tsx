'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, Trash2, Settings } from "lucide-react"
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
import { createPiketArea, deletePiketArea } from "@/actions/piket-actions"
import { useToast } from "@/components/ui/toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const formSchema = z.object({
  name: z.string().min(1, "Nama area harus diisi"),
  frequency: z.string().min(1, "Frekuensi harus dipilih"),
  description: z.string().optional(),
})

type ManageAreaDialogProps = {
  areas: any[]
  onUpdate: () => void
}

export function ManageAreaDialog({ areas, onUpdate }: ManageAreaDialogProps) {
  const [open, setOpen] = useState(false)
  const toast = useToast()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      frequency: "HARIAN",
      description: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const result = await createPiketArea(values)
    if (result.success) {
      toast.showToast("Area piket berhasil ditambahkan", "success")
      form.reset()
      onUpdate()
    } else {
      toast.showToast(result.error || "Gagal menambahkan area", "error")
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus area ini? Semua jadwal terkait akan terhapus.")) return
    const result = await deletePiketArea(id)
    if (result.success) {
      toast.showToast("Area berhasil dihapus", "success")
      onUpdate()
    } else {
      toast.showToast("Gagal menghapus area", "error")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Settings className="mr-2 h-4 w-4" />
          Kelola Area
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Kelola Area Piket</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Add Form */}
          <div className="p-4 border rounded-md bg-muted/20">
            <h3 className="text-sm font-medium mb-3">Tambah Area Baru</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Nama Area (misal: Masjid)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="frequency"
                    render={({ field }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Frekuensi" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="HARIAN">Harian</SelectItem>
                            <SelectItem value="MINGGUAN">Mingguan</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" size="sm" className="w-full">
                  <Plus className="mr-2 h-4 w-4" /> Tambah Area
                </Button>
              </form>
            </Form>
          </div>

          {/* List */}
          <div className="border rounded-md max-h-[300px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Area</TableHead>
                  <TableHead>Frekuensi</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {areas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Belum ada area piket
                    </TableCell>
                  </TableRow>
                ) : (
                  areas.map((area) => (
                    <TableRow key={area.id}>
                      <TableCell className="font-medium">{area.name}</TableCell>
                      <TableCell>{area.frequency}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(area.id)}
                          className="text-red-500 hover:text-red-700 h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

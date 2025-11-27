'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Settings, Plus, Pencil, Trash2 } from "lucide-react"
import { createLembagaCategory, updateLembagaCategory, deleteLembagaCategory } from "@/actions/lembaga-category-actions"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"

interface CategoryManagementDialogProps {
  lembagaId: string
  categories: any[]
}

export function CategoryManagementDialog({ lembagaId, categories }: CategoryManagementDialogProps) {
  const [open, setOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Group categories
  const grouped: Record<string, any[]> = {}
  categories.forEach(cat => {
    const group = cat.groupName || 'Tanpa Grup'
    if (!grouped[group]) grouped[group] = []
    grouped[group].push(cat)
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set('lembagaId', lembagaId)

    let result
    if (editingCategory) {
      result = await updateLembagaCategory(editingCategory.id, {
        name: formData.get('name') as string,
        groupName: formData.get('groupName') as string || null,
        gradeType: formData.get('gradeType') as "NUMERIC" | "LETTER"
      })
    } else {
      result = await createLembagaCategory({
        name: formData.get('name') as string,
        groupName: formData.get('groupName') as string || null,
        gradeType: formData.get('gradeType') as "NUMERIC" | "LETTER",
        lembagaId
      })
    }

    if (result.success) {
      setFormOpen(false)
      setEditingCategory(null)
      router.refresh()
    } else {
      alert(typeof result.error === 'string' ? result.error : 'Gagal menyimpan kategori')
    }

    setLoading(false)
  }

  const handleDelete = async () => {
    if (!deleteId) return

    setLoading(true)
    const result = await deleteLembagaCategory(deleteId)

    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || 'Gagal menghapus kategori')
    }

    setLoading(false)
    setDeleteId(null)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Kelola Kategori
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kelola Kategori Nilai Non-Mapel</DialogTitle>
            <DialogDescription>
              Tambah, edit, atau hapus kategori penilaian non-mapel
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Button onClick={() => { setEditingCategory(null); setFormOpen(true) }} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Kategori
            </Button>

            {Object.keys(grouped).sort().map(groupName => (
              <div key={groupName} className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground">{groupName}</h3>
                <div className="space-y-1">
                  {grouped[groupName].map(category => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-2 rounded-md border bg-card hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span>{category.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {category.gradeType === 'NUMERIC' ? 'Angka' : 'Huruf'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { setEditingCategory(category); setFormOpen(true) }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(category.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {categories.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Belum ada kategori</p>
                <p className="text-sm mt-2">Klik "Tambah Kategori" untuk membuat kategori baru</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit' : 'Tambah'} Kategori</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Kategori *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={editingCategory?.name}
                placeholder="contoh: Sholat"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="groupName">Grup (opsional)</Label>
              <Input
                id="groupName"
                name="groupName"
                defaultValue={editingCategory?.groupName || ''}
                placeholder="contoh: Fiqh"
              />
            </div>

            <div className="space-y-2">
              <Label>Tipe Nilai *</Label>
              <RadioGroup name="gradeType" defaultValue={editingCategory?.gradeType || "LETTER"}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="NUMERIC" id="numeric" />
                  <Label htmlFor="numeric" className="font-normal">Angka (0-100)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="LETTER" id="letter" />
                  <Label htmlFor="letter" className="font-normal">Huruf (A-E)</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)} disabled={loading}>
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kategori?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Kategori dan semua nilai yang terkait akan dihapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={loading}>
              {loading ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

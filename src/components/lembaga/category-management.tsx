"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, Trash2, GripVertical } from "lucide-react"
import { 
  createLembagaCategory, 
  updateLembagaCategory, 
  deleteLembagaCategory,
  getLembagaGroupNames 
} from "@/actions/lembaga-category-actions"
import { useToast } from "@/components/ui/toast"

interface Category {
  id: string
  name: string
  groupName: string | null
  gradeType: string
  order: number
  _count: {
    nilais: number
  }
}

interface CategoryManagementProps {
  lembagaId: string
  categories: Category[]
  grouped: Record<string, Category[]>
  existingGroups: string[]
}

export function CategoryManagement({ 
  lembagaId, 
  categories, 
  grouped,
  existingGroups 
}: CategoryManagementProps) {
  const [isPending, startTransition] = useTransition()
  const { showToast } = useToast()
  
  // Add dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryGroup, setNewCategoryGroup] = useState<string>("")
  const [newCategoryType, setNewCategoryType] = useState<"NUMERIC" | "LETTER">("LETTER")
  const [isNewGroup, setIsNewGroup] = useState(false)
  const [customGroupName, setCustomGroupName] = useState("")
  
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editName, setEditName] = useState("")
  const [editGroup, setEditGroup] = useState<string>("")
  const [editType, setEditType] = useState<"NUMERIC" | "LETTER">("LETTER")
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)

  const handleAddCategory = () => {
    startTransition(async () => {
      const groupName = isNewGroup ? customGroupName : (newCategoryGroup === "NONE" ? null : newCategoryGroup || null)
      
      const result = await createLembagaCategory({
        name: newCategoryName,
        groupName,
        gradeType: newCategoryType,
        lembagaId
      })

      if (result.success) {
        showToast("Kategori berhasil ditambahkan", "success")
        setAddDialogOpen(false)
        setNewCategoryName("")
        setNewCategoryGroup("NONE")
        setCustomGroupName("")
        setIsNewGroup(false)
        window.location.reload()
      } else {
        showToast(typeof result.error === 'string' ? result.error : "Gagal menambahkan kategori", "error")
      }
    })
  }

  const handleEditCategory = () => {
    if (!editingCategory) return
    
    startTransition(async () => {
      const result = await updateLembagaCategory(editingCategory.id, {
        name: editName,
        groupName: editGroup === "NONE" ? null : editGroup || null,
        gradeType: editType
      })

      if (result.success) {
        showToast("Kategori berhasil diupdate", "success")
        setEditDialogOpen(false)
        setEditingCategory(null)
        window.location.reload()
      } else {
        showToast("Gagal mengupdate kategori", "error")
      }
    })
  }

  const handleDeleteCategory = () => {
    if (!deletingCategory) return
    
    startTransition(async () => {
      const result = await deleteLembagaCategory(deletingCategory.id)

      if (result.success) {
        showToast("Kategori berhasil dihapus", "success")
        setDeleteDialogOpen(false)
        setDeletingCategory(null)
        window.location.reload()
      } else {
        showToast("Gagal menghapus kategori", "error")
      }
    })
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory(category)
    setEditName(category.name)
    setEditGroup(category.groupName || "NONE")
    setEditType(category.gradeType as "NUMERIC" | "LETTER")
    setEditDialogOpen(true)
  }

  const openDeleteDialog = (category: Category) => {
    setDeletingCategory(category)
    setDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Kelola Kategori Nilai</h2>
          <p className="text-muted-foreground">
            Tambah, edit, atau hapus kategori penilaian untuk lembaga ini
          </p>
        </div>
        
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Kategori
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Kategori Baru</DialogTitle>
              <DialogDescription>
                Buat kategori penilaian baru untuk lembaga ini
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="categoryName">Nama Kategori *</Label>
                <Input
                  id="categoryName"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="contoh: Sholat, Zakat, Kepribadian"
                />
              </div>

              <div>
                <Label>Group (Opsional)</Label>
                <div className="space-y-2">
                  <Select 
                    value={isNewGroup ? "NEW_GROUP" : newCategoryGroup} 
                    onValueChange={(value) => {
                      if (value === "NEW_GROUP") {
                        setIsNewGroup(true)
                        setNewCategoryGroup("")
                      } else {
                        setIsNewGroup(false)
                        setNewCategoryGroup(value)
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih group atau buat baru" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">Tanpa Group</SelectItem>
                      <SelectItem value="NEW_GROUP">+ Buat Group Baru</SelectItem>
                      {existingGroups.map((group) => (
                        <SelectItem key={group} value={group}>{group}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {isNewGroup && (
                    <Input
                      value={customGroupName}
                      onChange={(e) => setCustomGroupName(e.target.value)}
                      placeholder="Nama group baru (contoh: Fiqh, Akhlak)"
                    />
                  )}
                </div>
              </div>

              <div>
                <Label>Tipe Nilai *</Label>
                <Select value={newCategoryType} onValueChange={(v) => setNewCategoryType(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LETTER">Huruf (A-E)</SelectItem>
                    <SelectItem value="NUMERIC">Angka (0-100)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleAddCategory} disabled={isPending || !newCategoryName}>
                {isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories List */}
      <div className="space-y-4">
        {Object.entries(grouped).map(([groupName, cats]) => (
          <Card key={groupName}>
            <CardHeader>
              <CardTitle className="text-lg">
                {groupName === "Ungrouped" ? "Tanpa Group" : groupName}
              </CardTitle>
              <CardDescription>
                {cats.length} kategori
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {cats.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {category.gradeType === "LETTER" ? "Huruf (A-E)" : "Angka (0-100)"} • 
                          {category._count.nilais} nilai tersimpan
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(category)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Kategori</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="editName">Nama Kategori *</Label>
              <Input
                id="editName"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>

            <div>
              <Label>Group</Label>
              <Select value={editGroup} onValueChange={setEditGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">Tanpa Group</SelectItem>
                  {existingGroups.map((group) => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tipe Nilai *</Label>
              <Select value={editType} onValueChange={(v) => setEditType(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LETTER">Huruf (A-E)</SelectItem>
                  <SelectItem value="NUMERIC">Angka (0-100)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleEditCategory} disabled={isPending || !editName}>
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kategori?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus kategori <strong>{deletingCategory?.name}</strong>?
              {deletingCategory && deletingCategory._count.nilais > 0 && (
                <span className="block mt-2 text-destructive font-semibold">
                  ⚠️ Ini akan menghapus {deletingCategory._count.nilais} nilai yang sudah tersimpan!
                </span>
              )}
              <span className="block mt-2">
                Tindakan ini tidak dapat dibatalkan.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

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
  createMapelGroup, 
  updateMapelGroup, 
  deleteMapelGroup 
} from "@/actions/mapel-group-actions"
import { useToast } from "@/components/ui/toast"

interface MapelGroup {
  id: string
  name: string
  lembagaId: string
  order: number
  lembaga: {
    id: string
    name: string
  }
  _count: {
    mapels: number
  }
}

interface MapelGroupManagementProps {
  groups: MapelGroup[]
  grouped: Record<string, MapelGroup[]>
  lembagas: any[]
}

export function MapelGroupManagement({ 
  groups, 
  grouped,
  lembagas 
}: MapelGroupManagementProps) {
  const [isPending, startTransition] = useTransition()
  const { showToast } = useToast()
  
  // Add dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")
  const [newGroupLembagaId, setNewGroupLembagaId] = useState("")
  
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<MapelGroup | null>(null)
  const [editName, setEditName] = useState("")
  const [editLembagaId, setEditLembagaId] = useState("")
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingGroup, setDeletingGroup] = useState<MapelGroup | null>(null)

  const handleAddGroup = () => {
    startTransition(async () => {
      const result = await createMapelGroup({
        name: newGroupName,
        lembagaId: newGroupLembagaId
      })

      if (result.success) {
        showToast("Group berhasil ditambahkan", "success")
        setAddDialogOpen(false)
        setNewGroupName("")
        setNewGroupLembagaId("")
        window.location.reload()
      } else {
        showToast(typeof result.error === 'string' ? result.error : "Gagal menambahkan group", "error")
      }
    })
  }

  const handleEditGroup = () => {
    if (!editingGroup) return
    
    startTransition(async () => {
      const result = await updateMapelGroup(editingGroup.id, {
        name: editName,
        lembagaId: editLembagaId
      })

      if (result.success) {
        showToast("Group berhasil diupdate", "success")
        setEditDialogOpen(false)
        setEditingGroup(null)
        window.location.reload()
      } else {
        showToast("Gagal mengupdate group", "error")
      }
    })
  }

  const handleDeleteGroup = () => {
    if (!deletingGroup) return
    
    startTransition(async () => {
      const result = await deleteMapelGroup(deletingGroup.id)

      if (result.success) {
        showToast("Group berhasil dihapus", "success")
        setDeleteDialogOpen(false)
        setDeletingGroup(null)
        window.location.reload()
      } else {
        showToast("Gagal menghapus group", "error")
      }
    })
  }

  const openEditDialog = (group: MapelGroup) => {
    setEditingGroup(group)
    setEditName(group.name)
    setEditLembagaId(group.lembagaId)
    setEditDialogOpen(true)
  }

  const openDeleteDialog = (group: MapelGroup) => {
    setDeletingGroup(group)
    setDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Kelola Group Mata Pelajaran</h2>
          <p className="text-muted-foreground">
            Tambah, edit, atau hapus group mata pelajaran per lembaga
          </p>
        </div>
        
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Group Baru</DialogTitle>
              <DialogDescription>
                Buat group mata pelajaran baru untuk lembaga tertentu
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="lembagaId">Lembaga *</Label>
                <Select value={newGroupLembagaId} onValueChange={setNewGroupLembagaId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih lembaga" />
                  </SelectTrigger>
                  <SelectContent>
                    {lembagas.map((lembaga) => (
                      <SelectItem key={lembaga.id} value={lembaga.id}>
                        {lembaga.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="groupName">Nama Group *</Label>
                <Input
                  id="groupName"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="contoh: Fiqh, Aqidah, Hadits"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleAddGroup} disabled={isPending || !newGroupName || !newGroupLembagaId}>
                {isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Groups List */}
      <div className="space-y-4">
        {Object.entries(grouped).map(([lembagaName, grps]) => (
          <Card key={lembagaName}>
            <CardHeader>
              <CardTitle className="text-lg">{lembagaName}</CardTitle>
              <CardDescription>
                {grps.length} group
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {grps.map((group) => (
                  <div
                    key={group.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                      <div>
                        <p className="font-medium">{group.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {group._count.mapels} mata pelajaran
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(group)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(group)}
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
            <DialogTitle>Edit Group</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Lembaga *</Label>
              <Select value={editLembagaId} onValueChange={setEditLembagaId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {lembagas.map((lembaga) => (
                    <SelectItem key={lembaga.id} value={lembaga.id}>
                      {lembaga.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="editName">Nama Group *</Label>
              <Input
                id="editName"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleEditGroup} disabled={isPending || !editName || !editLembagaId}>
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Group?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus group <strong>{deletingGroup?.name}</strong>?
              {deletingGroup && deletingGroup._count.mapels > 0 && (
                <span className="block mt-2 text-orange-600 font-semibold">
                  ⚠️ {deletingGroup._count.mapels} mata pelajaran akan menjadi tanpa group!
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
              onClick={handleDeleteGroup}
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

'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  updateGradeSetting,
  deleteGradeSetting,
  initializeDefaultGrades,
} from "@/actions/grade-setting-actions"
import { useToast } from "@/components/ui/toast"
import { Pencil, Trash2, Save, X, RefreshCw } from "lucide-react"

interface GradeSetting {
  id: string
  gradeValue: number
  label: string
  description: string | null
}

interface GradeSettingsManagementProps {
  lembagaId: string
  settings: GradeSetting[]
}

export function GradeSettingsManagement({ lembagaId, settings }: GradeSettingsManagementProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [isPending, setIsPending] = useState(false)
  const { showToast } = useToast()
  const router = useRouter()

  function startEdit(setting: GradeSetting) {
    setEditingId(setting.id)
    setEditLabel(setting.label)
    setEditDescription(setting.description || "")
  }

  function cancelEdit() {
    setEditingId(null)
    setEditLabel("")
    setEditDescription("")
  }

  async function handleSave(id: string) {
    if (!editLabel.trim()) {
      showToast("Label tidak boleh kosong", "error")
      return
    }

    setIsPending(true)

    try {
      const formData = new FormData()
      formData.append("label", editLabel)
      if (editDescription) formData.append("description", editDescription)

      const result = await updateGradeSetting(id, formData)

      if (result.success) {
        showToast("Pengaturan nilai berhasil diupdate", "success")
        setEditingId(null)
        router.refresh()
      } else {
        showToast(result.error as string, "error")
      }
    } catch (error) {
      showToast("Terjadi kesalahan", "error")
    } finally {
      setIsPending(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus pengaturan nilai ini?")) return

    setIsPending(true)

    try {
      const result = await deleteGradeSetting(id)

      if (result.success) {
        showToast("Pengaturan nilai berhasil dihapus", "success")
        router.refresh()
      } else {
        showToast(result.error as string, "error")
      }
    } catch (error) {
      showToast("Terjadi kesalahan", "error")
    } finally {
      setIsPending(false)
    }
  }

  async function handleInitializeDefaults() {
    if (!confirm("Ini akan membuat pengaturan nilai default (1-10). Lanjutkan?")) return

    setIsPending(true)

    try {
      const result = await initializeDefaultGrades(lembagaId)

      if (result.success) {
        showToast(result.message || "Pengaturan nilai default berhasil dibuat", "success")
        router.refresh()
      } else {
        showToast(result.error as string, "error")
      }
    } catch (error) {
      showToast("Terjadi kesalahan", "error")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Pengaturan Nilai Ujian Hifdz</CardTitle>
            <CardDescription>
              Atur label dan keterangan untuk setiap nilai (1-10)
            </CardDescription>
          </div>
          {settings.length === 0 && (
            <Button onClick={handleInitializeDefaults} disabled={isPending}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Inisialisasi Default
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {settings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Belum ada pengaturan nilai.</p>
            <p className="text-sm mt-2">Klik tombol "Inisialisasi Default" untuk membuat pengaturan default.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Nilai</TableHead>
                <TableHead>Label / Keterangan</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead className="w-32 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settings.map((setting) => (
                <TableRow key={setting.id}>
                  <TableCell className="font-bold text-lg">
                    {setting.gradeValue}
                  </TableCell>
                  <TableCell>
                    {editingId === setting.id ? (
                      <Input
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        placeholder="Label (contoh: تمام)"
                        disabled={isPending}
                      />
                    ) : (
                      <span className="font-medium">{setting.label}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === setting.id ? (
                      <Input
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Deskripsi (opsional)"
                        disabled={isPending}
                      />
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {setting.description || "-"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingId === setting.id ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSave(setting.id)}
                          disabled={isPending}
                        >
                          <Save className="h-3 w-3 mr-1" />
                          Simpan
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEdit}
                          disabled={isPending}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Batal
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEdit(setting)}
                          disabled={isPending}
                        >
                          <Pencil className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(setting.id)}
                          disabled={isPending}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

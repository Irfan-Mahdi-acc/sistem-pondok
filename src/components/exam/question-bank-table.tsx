'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, FileText, FolderPlus, Pencil } from "lucide-react"
import { useState } from "react"
import { AddQuestionDialog } from "./add-question-dialog"
import { deleteQuestion } from "@/actions/question-actions"

export function QuestionBankTable({
  mapelId,
  mapelName,
  questions,
  categories
}: {
  mapelId: string
  mapelName: string
  questions: any[]
  categories: any[]
}) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<any>(null)
  const [isExporting, setIsExporting] = useState(false)

  async function handleDelete(id: string) {
    if (confirm('Yakin hapus soal ini?')) {
      const res = await deleteQuestion(id)
      if (res.success) {
        window.location.reload()
      }
    }
  }

  function handleEdit(question: any) {
    setEditingQuestion(question)
    setShowAddDialog(true)
  }

  async function handleExportWord() {
    setIsExporting(true)
    try {
      const { exportToWord } = await import("@/lib/export-to-word")
      await exportToWord({
        title: "Bank Soal",
        subject: mapelName,
        className: "-", // Bank soal doesn't have specific class context usually, or we can pass it if available
        questions: questions,
        includeAnswerKey: true,
        kopSurat: {
          namaPondok: "PONDOK PESANTREN TADZIMUSSUNNAH",
          alamat: "Jl. Raya Tadzimussunnah No. 1, Kota Santri",
          kontak: "Telp: (021) 12345678 | Email: info@tadzimussunnah.com",
        }
      })
    } catch (error) {
      console.error("Export failed:", error)
      alert("Gagal mengekspor Word")
    } finally {
      setIsExporting(false)
    }
  }

  function getTypeLabel(type: string) {
    const labels: Record<string, string> = {
      'MULTIPLE_CHOICE': 'Pilihan Ganda',
      'ESSAY': 'Essay',
      'TRUE_FALSE': 'Benar/Salah'
    }
    return labels[type] || type
  }

  function getDifficultyColor(difficulty: string) {
    const colors: Record<string, string> = {
      'EASY': 'bg-green-500',
      'MEDIUM': 'bg-yellow-500',
      'HARD': 'bg-red-500'
    }
    return colors[difficulty] || 'bg-gray-500'
  }

  function getDifficultyLabel(difficulty: string) {
    const labels: Record<string, string> = {
      'EASY': 'Mudah',
      'MEDIUM': 'Sedang',
      'HARD': 'Sulit'
    }
    return labels[difficulty] || difficulty
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Daftar Soal ({questions.length})</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <FolderPlus className="h-4 w-4 mr-2" />
                Kelola Kategori
              </Button>
              <Button size="sm" variant="outline" onClick={handleExportWord} disabled={isExporting}>
                <FileText className="h-4 w-4 mr-2" />
                {isExporting ? "Mengekspor..." : "Export Word"}
              </Button>
              <Button size="sm" onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Soal
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Belum ada soal. Klik "Tambah Soal" untuk menambahkan.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">No</TableHead>
                    <TableHead>Pertanyaan</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Kesulitan</TableHead>
                    <TableHead>Poin</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questions.map((question, index) => (
                    <TableRow key={question.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="max-w-md">
                        <div className="line-clamp-2">{question.question}</div>
                        {question.options.length > 0 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {question.options.length} pilihan jawaban
                          </div>
                        )}
                        {question.imageUrl && (
                          <div className="mt-1">
                            <img src={question.imageUrl} alt="Soal" className="h-10 w-10 object-cover rounded" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getTypeLabel(question.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {question.category ? (
                          <Badge variant="secondary">{question.category.name}</Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getDifficultyColor(question.difficulty)}>
                          {getDifficultyLabel(question.difficulty)}
                        </Badge>
                      </TableCell>
                      <TableCell>{question.points}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(question)}
                            className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(question.id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AddQuestionDialog
        mapelId={mapelId}
        categories={categories}
        open={showAddDialog}
        onOpenChange={(open) => {
          setShowAddDialog(open)
          if (!open) setEditingQuestion(null)
        }}
        onSuccess={() => window.location.reload()}
        mode={editingQuestion ? "edit" : "add"}
        initialData={editingQuestion}
      />
    </>
  )
}

'use client'

import { FileText, Pencil, Plus, Trash2, ArrowUp, ArrowDown, Type, Heading, Loader2 } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AddExamQuestionDialog } from "./add-exam-question-dialog"
import { moveExamQuestion, removeQuestionFromExam } from "@/actions/exam-actions"
import { getPDFSettings } from "@/actions/settings-actions"
import { useRouter } from "next/navigation"

export function ExamBuilder({
  exam,
  mapelId
}: {
  exam: any
  mapelId: string
}) {
  const router = useRouter()
  const [questions, setQuestions] = useState(exam.questions)
  const [isExporting, setIsExporting] = useState(false)
  const [pdfSettings, setPdfSettings] = useState<any>(null)

  useEffect(() => {
    async function loadSettings() {
      const data = await getPDFSettings()
      setPdfSettings(data)
    }
    loadSettings()
  }, [])

  // Group questions by section
  const sections = useMemo(() => {
    const groups: { header: any | null, items: any[] }[] = []
    let currentGroup: { header: any | null, items: any[] } = { header: null, items: [] }
    
    // Sort questions by order first to be safe
    const sortedQuestions = [...questions].sort((a: any, b: any) => a.order - b.order)

    sortedQuestions.forEach((q: any) => {
      if (q.itemType === 'SECTION_HEADER') {
        if (currentGroup.header || currentGroup.items.length > 0) {
          groups.push(currentGroup)
        }
        currentGroup = { header: q, items: [] }
      } else {
        currentGroup.items.push(q)
      }
    })
    groups.push(currentGroup)
    return groups
  }, [questions])

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add")
  const [dialogItemType, setDialogItemType] = useState<"QUESTION" | "SECTION_HEADER" | "INSTRUCTION">("QUESTION")
  const [editingItem, setEditingItem] = useState<any>(null)
  const [insertAtOrder, setInsertAtOrder] = useState<number | undefined>(undefined)

  const handleAddSection = () => {
    setDialogMode("add")
    setDialogItemType("SECTION_HEADER")
    setEditingItem(null)
    setInsertAtOrder(undefined) // Add to end
    setDialogOpen(true)
  }

  const handleAddItemToSection = (sectionIndex: number, type: "QUESTION" | "INSTRUCTION") => {
    const section = sections[sectionIndex]
    const nextSection = sections[sectionIndex + 1]
    
    let targetOrder: number | undefined = undefined

    if (nextSection && nextSection.header) {
      targetOrder = nextSection.header.order
    } else {
      targetOrder = undefined
    }

    setDialogMode("add")
    setDialogItemType(type)
    setEditingItem(null)
    setInsertAtOrder(targetOrder)
    setDialogOpen(true)
  }

  const handleEditItem = (item: any) => {
    setDialogMode("edit")
    setDialogItemType(item.itemType as any)
    setEditingItem(item)
    setInsertAtOrder(undefined)
    setDialogOpen(true)
  }

  async function handleRemoveQuestion(id: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus item ini?")) return
    const res = await removeQuestionFromExam(id)
    if (res.success) {
      setQuestions(questions.filter((q: any) => q.id !== id))
      router.refresh()
    } else {
      alert(res.error)
    }
  }

  async function handleMoveQuestion(id: string, direction: 'up' | 'down') {
    const res = await moveExamQuestion(id, direction)
    if (res.success) {
      router.refresh()
      // Optimistic update could be done here but refresh is safer for order
      window.location.reload() 
    } else {
      alert(res.error)
    }
  }

  async function handleExportWord() {
    setIsExporting(true)
    try {
      const { exportToWord } = await import("@/lib/export-to-word")
      const exportQuestions = questions.map((q: any) => ({
        id: q.id,
        question: q.questionBank ? q.questionBank.question : q.directQuestion,
        type: q.questionBank ? q.questionBank.type : q.directType,
        options: q.questionBank ? q.questionBank.options : q.directOptions,
        imageUrl: q.questionBank ? q.questionBank.imageUrl : q.imageUrl,
        points: q.points,
        itemType: q.itemType || "QUESTION"
      }))

      await exportToWord({
        title: exam.name,
        subject: exam.mapel.name,
        className: exam.mapel.kelas.name,
        questions: exportQuestions,
        includeAnswerKey: true,
        kopSurat: pdfSettings ? {
          namaPondok: pdfSettings.pondokProfile.name,
          alamat: pdfSettings.pondokProfile.address || "",
          kontak: `Telp: ${pdfSettings.pondokProfile.phone || "-"} | Email: ${pdfSettings.pondokProfile.email || "-"}`,
          logoUrl: pdfSettings.settings.showLogo ? pdfSettings.pondokProfile.logoUrl : undefined
        } : undefined
      })
    } catch (error) {
      console.error("Export failed:", error)
      alert("Gagal mengekspor Word")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button onClick={handleAddSection} variant="outline">
            <Plus className="mr-2 h-4 w-4" /> Tambah Bagian
          </Button>
          <Button onClick={handleExportWord} variant="secondary" disabled={isExporting}>
            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
            Export Word
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          Total Soal: {questions.filter((q: any) => q.itemType === 'QUESTION').length} | 
          Total Poin: {questions.reduce((acc: number, q: any) => acc + (q.points || 0), 0)}
        </div>
      </div>

      <div className="space-y-6">
        {sections.map((section, idx) => (
          <Card key={section.header?.id || `section-${idx}`} className="relative">
            {section.header && (
              <div className="absolute top-4 right-4 flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleEditItem(section.header)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleRemoveQuestion(section.header.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <CardHeader className={section.header ? "pb-2" : "pb-0"}>
              {section.header ? (
                <CardTitle className="text-xl">{section.header.directQuestion}</CardTitle>
              ) : (
                sections.length > 1 && <div className="text-sm text-muted-foreground italic">Bagian Awal (Tanpa Judul)</div>
              )}
            </CardHeader>
            
            <CardContent className="space-y-4 pt-4">
              {section.items.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
                  Belum ada soal atau instruksi di bagian ini
                </div>
              ) : (
                <div className="space-y-4">
                  {section.items.map((q: any, qIdx: number) => (
                    <div key={q.id} className="group relative border rounded-lg p-4 hover:bg-accent/5 transition-colors">
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleMoveQuestion(q.id, 'up')}>
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleMoveQuestion(q.id, 'down')}>
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditItem(q)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRemoveQuestion(q.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {q.itemType === 'INSTRUCTION' ? (
                        <div className="italic text-muted-foreground">
                          <span className="font-semibold not-italic text-foreground">Instruksi: </span>
                          {q.directQuestion}
                        </div>
                      ) : (
                        <div className="flex gap-4">
                          <div className="font-mono text-lg font-bold text-muted-foreground w-8">
                            {questions
                              .filter((item: any) => item.itemType === 'QUESTION' && item.order <= q.order)
                              .length}.
                          </div>
                          <div className="flex-1">
                            <div className="mb-2 font-medium">{q.directQuestion || q.questionBank?.question}</div>
                            {q.imageUrl && (
                              <img src={q.imageUrl} alt="Soal" className="max-w-[200px] rounded mb-2" />
                            )}
                            {(q.directOptions || q.questionBank?.options) && (
                              <div className="grid grid-cols-1 gap-2 pl-4">
                                {(q.directOptions ? JSON.parse(q.directOptions) : q.questionBank?.options).map((opt: any, optIdx: number) => (
                                  <div key={optIdx} className={`text-sm ${opt.isCorrect ? 'text-green-600 font-medium' : 'text-muted-foreground'}`}>
                                    {String.fromCharCode(65 + optIdx)}. {opt.optionText}
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="mt-2 flex gap-2">
                              <Badge variant="secondary">{q.points} Poin</Badge>
                              <Badge variant="outline">{q.directType || q.questionBank?.type}</Badge>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 justify-center pt-4 border-t mt-4">
                <Button variant="ghost" size="sm" onClick={() => handleAddItemToSection(idx, "QUESTION")}>
                  <Plus className="mr-2 h-4 w-4" /> Tambah Soal
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleAddItemToSection(idx, "INSTRUCTION")}>
                  <FileText className="mr-2 h-4 w-4" /> Tambah Instruksi
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {sections.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <h3 className="text-lg font-medium">Belum ada konten ujian</h3>
            <p className="text-muted-foreground mb-4">Mulai dengan menambahkan bagian baru</p>
            <Button onClick={handleAddSection}>
              <Plus className="mr-2 h-4 w-4" /> Tambah Bagian Pertama
            </Button>
          </div>
        )}
      </div>

      <AddExamQuestionDialog 
        examId={exam.id}
        mapelId={mapelId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => {
          router.refresh()
          setDialogOpen(false)
          // Force reload to get fresh order
          window.location.reload()
        }}
        mode={dialogMode}
        initialData={editingItem}
        itemType={dialogItemType}
        insertAtOrder={insertAtOrder}
      />
    </div>
  )
}

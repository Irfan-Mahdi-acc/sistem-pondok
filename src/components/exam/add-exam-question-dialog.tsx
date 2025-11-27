'use client'

import { addQuestionToExam, updateExamQuestion } from "@/actions/exam-actions"
import { getQuestionsForExam } from "@/actions/question-actions"
import { useState, useEffect } from "react"
import { Search, Plus, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageUpload } from "@/components/ui/image-upload"

export function AddExamQuestionDialog({ 
  examId,
  mapelId,
  open, 
  onOpenChange,
  onSuccess,
  mode = "add",
  initialData,
  itemType = "QUESTION",
  insertAtOrder
}: { 
  examId: string
  mapelId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  mode?: "add" | "edit"
  initialData?: any
  itemType?: "QUESTION" | "SECTION_HEADER" | "INSTRUCTION"
  insertAtOrder?: number
}) {
  const [activeTab, setActiveTab] = useState("bank")
  
  // Bank Question State
  const [bankQuestions, setBankQuestions] = useState<any[]>([])
  const [selectedBankQuestion, setSelectedBankQuestion] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)

  // Direct Question State
  const [directType, setDirectType] = useState("MULTIPLE_CHOICE")
  const [directQuestion, setDirectQuestion] = useState("")
  const [directPoints, setDirectPoints] = useState(1)
  const [imageUrl, setImageUrl] = useState<string>("")
  const [directOptions, setDirectOptions] = useState([
    { optionText: "", isCorrect: false },
    { optionText: "", isCorrect: false },
    { optionText: "", isCorrect: false },
    { optionText: "", isCorrect: false },
  ])

  useEffect(() => {
    if (open) {
      if (mode === "edit" && initialData) {
        // Pre-fill for edit
        if (initialData.questionBankId) {
          setActiveTab("bank")
          setSelectedBankQuestion(initialData.questionBankId)
        } else {
          setActiveTab("direct")
          setDirectQuestion(initialData.directQuestion || "")
          setDirectType(initialData.directType || "MULTIPLE_CHOICE")
          setDirectPoints(initialData.points || (itemType === "QUESTION" ? 1 : 0))
          setImageUrl(initialData.imageUrl || "")
          if (initialData.directOptions) {
            try {
              setDirectOptions(JSON.parse(initialData.directOptions))
            } catch (e) {
              console.error("Failed to parse options", e)
            }
          }
        }
      } else {
        // Reset for add
        if (itemType === "QUESTION") {
          setActiveTab("bank")
        } else {
          setActiveTab("direct")
        }
        
        setDirectQuestion("")
        setDirectPoints(itemType === "QUESTION" ? 1 : 0)
        setImageUrl("")
        setDirectOptions([
          { optionText: "", isCorrect: false },
          { optionText: "", isCorrect: false },
          { optionText: "", isCorrect: false },
          { optionText: "", isCorrect: false },
        ])
        setSelectedBankQuestion(null)
      }
    }
  }, [open, mode, initialData, itemType])

  useEffect(() => {
    if (open && activeTab === "bank" && itemType === "QUESTION") {
      fetchBankQuestions()
    }
  }, [open, activeTab, search, itemType])

  async function fetchBankQuestions() {
    setLoading(true)
    const questions = await getQuestionsForExam(mapelId, { search })
    setBankQuestions(questions)
    setLoading(false)
  }

  async function handleAddFromBank() {
    if (!selectedBankQuestion) return

    const formData = new FormData()
    formData.append('ujianId', examId)
    formData.append('questionBankId', selectedBankQuestion)
    formData.append('itemType', "QUESTION")
    
    if (insertAtOrder !== undefined) {
      formData.append('insertAtOrder', insertAtOrder.toString())
    }
    
    // Get points from selected question
    const question = bankQuestions.find(q => q.id === selectedBankQuestion)
    if (question) {
      formData.append('points', question.points.toString())
    }

    const res = await addQuestionToExam(formData)
    if (res.success) {
      onOpenChange(false)
      onSuccess()
      setSelectedBankQuestion(null)
    } else {
      alert('Gagal menambahkan soal: ' + (res.error || 'Unknown error'))
    }
  }

  async function handleAddDirect() {
    const formData = new FormData()
    formData.append('ujianId', examId)
    formData.append('directQuestion', directQuestion)
    formData.append('itemType', itemType)
    
    if (insertAtOrder !== undefined) {
      formData.append('insertAtOrder', insertAtOrder.toString())
    }
    
    // Handle points
    const pointsToSend = itemType === "QUESTION" ? (isNaN(directPoints) ? 1 : directPoints) : 0
    formData.append('points', pointsToSend.toString())

    // Handle type and options only for questions
    if (itemType === "QUESTION") {
      formData.append('directType', directType)
      
      if (imageUrl) {
        formData.append('imageUrl', imageUrl)
      }

      if (directType === "MULTIPLE_CHOICE" || directType === "TRUE_FALSE") {
        formData.append('directOptions', JSON.stringify(directOptions))
      }
    }

    let res;
    if (mode === "edit" && initialData) {
      res = await updateExamQuestion(initialData.id, formData)
    } else {
      res = await addQuestionToExam(formData)
    }

    if (res.success) {
      onOpenChange(false)
      onSuccess()
      // Reset form
      setDirectQuestion("")
      setImageUrl("")
      setDirectOptions([
        { optionText: "", isCorrect: false },
        { optionText: "", isCorrect: false },
        { optionText: "", isCorrect: false },
        { optionText: "", isCorrect: false },
      ])
    } else {
      alert(`Gagal ${mode === "edit" ? "mengupdate" : "menambahkan"} item: ` + (res.error || 'Unknown error'))
    }
  }

  function updateDirectOption(index: number, field: string, value: any) {
    const newOptions = [...directOptions]
    newOptions[index] = { ...newOptions[index], [field]: value }
    setDirectOptions(newOptions)
  }

  const getTitle = () => {
    if (mode === "edit") {
      if (itemType === "SECTION_HEADER") return "Edit Bagian"
      if (itemType === "INSTRUCTION") return "Edit Instruksi"
      return "Edit Soal Ujian"
    }
    if (itemType === "SECTION_HEADER") return "Tambah Bagian Baru"
    if (itemType === "INSTRUCTION") return "Tambah Instruksi"
    return "Tambah Soal Ujian"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {mode === "add" && itemType === "QUESTION" && (
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="bank">Ambil dari Bank Soal</TabsTrigger>
              <TabsTrigger value="direct">Buat Soal Baru</TabsTrigger>
            </TabsList>
          )}

          <TabsContent value="bank" className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari soal..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="border rounded-md h-[400px] overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="text-center py-4">Memuat soal...</div>
              ) : bankQuestions.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">Tidak ada soal ditemukan</div>
              ) : (
                bankQuestions.map((q) => (
                  <div 
                    key={q.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedBankQuestion === q.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedBankQuestion(q.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-2">
                        <Badge variant="outline">{q.type}</Badge>
                        <Badge variant="secondary">{q.difficulty}</Badge>
                        <Badge>{q.points} Poin</Badge>
                      </div>
                      {selectedBankQuestion === q.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <p className="font-medium mb-2">{q.question}</p>
                    {q.imageUrl && (
                      <img src={q.imageUrl} alt="Soal" className="max-w-[100px] max-h-[100px] rounded mb-2" />
                    )}
                    <div className="text-sm text-muted-foreground">
                      {q.category?.name}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button onClick={handleAddFromBank} disabled={!selectedBankQuestion}>
                Tambahkan Terpilih
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="direct" className="space-y-4">
            <div className="space-y-2">
              <Label>
                {itemType === "SECTION_HEADER" ? "Judul Bagian *" : 
                 itemType === "INSTRUCTION" ? "Teks Instruksi *" : 
                 "Pertanyaan *"}
              </Label>
              <Textarea
                value={directQuestion}
                onChange={(e) => setDirectQuestion(e.target.value)}
                placeholder={
                  itemType === "SECTION_HEADER" ? "Contoh: Bagian A - Pilihan Ganda" :
                  itemType === "INSTRUCTION" ? "Contoh: Pilihlah jawaban yang paling benar..." :
                  "Tulis pertanyaan..."
                }
                required
              />
            </div>

            {itemType === "QUESTION" && (
              <div className="space-y-2">
                <ImageUpload
                  value={imageUrl}
                  onChange={setImageUrl}
                  onRemove={() => setImageUrl("")}
                />
              </div>
            )}

            {itemType === "QUESTION" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipe Soal</Label>
                  <Select value={directType} onValueChange={setDirectType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MULTIPLE_CHOICE">Pilihan Ganda</SelectItem>
                      <SelectItem value="ESSAY">Essay</SelectItem>
                      <SelectItem value="TRUE_FALSE">Benar/Salah</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Poin</Label>
                  <Input
                    type="number"
                    value={directPoints}
                    onChange={(e) => setDirectPoints(parseInt(e.target.value))}
                    min={1}
                  />
                </div>
              </div>
            )}

            {itemType === "QUESTION" && (directType === "MULTIPLE_CHOICE" || directType === "TRUE_FALSE") && (
              <div className="space-y-2">
                <Label>Pilihan Jawaban</Label>
                {directOptions.map((opt, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input
                      placeholder={`Pilihan ${String.fromCharCode(65 + idx)}`}
                      value={opt.optionText}
                      onChange={(e) => updateDirectOption(idx, 'optionText', e.target.value)}
                    />
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={opt.isCorrect}
                        onChange={(e) => updateDirectOption(idx, 'isCorrect', e.target.checked)}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">Benar</span>
                    </label>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button onClick={handleAddDirect}>
                {mode === "edit" ? "Simpan Perubahan" : "Simpan"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

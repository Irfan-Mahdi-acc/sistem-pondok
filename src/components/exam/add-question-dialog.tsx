'use client'

import { createQuestion, updateQuestion } from "@/actions/question-actions"
import { useState, useEffect } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/ui/image-upload"

export function AddQuestionDialog({ 
  mapelId,
  categories,
  open, 
  onOpenChange,
  onSuccess,
  mode = "add",
  initialData
}: { 
  mapelId: string
  categories: any[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  mode?: "add" | "edit"
  initialData?: any
}) {
  const [type, setType] = useState<string>("MULTIPLE_CHOICE")
  const [imageUrl, setImageUrl] = useState<string>("")
  const [options, setOptions] = useState([
    { optionText: "", isCorrect: false },
    { optionText: "", isCorrect: false },
    { optionText: "", isCorrect: false },
    { optionText: "", isCorrect: false },
  ])
  const [questionText, setQuestionText] = useState("")
  const [difficulty, setDifficulty] = useState("MEDIUM")
  const [categoryId, setCategoryId] = useState("")
  const [points, setPoints] = useState(1)
  const [explanation, setExplanation] = useState("")

  useEffect(() => {
    if (open) {
      if (mode === "edit" && initialData) {
        setQuestionText(initialData.question)
        setType(initialData.type)
        setDifficulty(initialData.difficulty)
        setCategoryId(initialData.categoryId || "")
        setPoints(initialData.points)
        setExplanation(initialData.explanation || "")
        setImageUrl(initialData.imageUrl || "")
        
        if (initialData.options && initialData.options.length > 0) {
          setOptions(initialData.options.map((opt: any) => ({
            optionText: opt.optionText,
            isCorrect: opt.isCorrect
          })))
        } else {
          setOptions([
            { optionText: "", isCorrect: false },
            { optionText: "", isCorrect: false },
            { optionText: "", isCorrect: false },
            { optionText: "", isCorrect: false },
          ])
        }
      } else {
        // Reset for add
        setQuestionText("")
        setType("MULTIPLE_CHOICE")
        setDifficulty("MEDIUM")
        setCategoryId("")
        setPoints(1)
        setExplanation("")
        setImageUrl("")
        setOptions([
          { optionText: "", isCorrect: false },
          { optionText: "", isCorrect: false },
          { optionText: "", isCorrect: false },
          { optionText: "", isCorrect: false },
        ])
      }
    }
  }, [open, mode, initialData])

  async function handleSubmit(formData: FormData) {
    formData.append('mapelId', mapelId)
    formData.append('type', type)
    if (imageUrl) {
      formData.append('imageUrl', imageUrl)
    }
    
    // Add options as JSON for multiple choice
    if (type === "MULTIPLE_CHOICE" || type === "TRUE_FALSE") {
      formData.append('options', JSON.stringify(options))
    }
    
    let res;
    if (mode === "edit" && initialData) {
      res = await updateQuestion(initialData.id, formData)
    } else {
      res = await createQuestion(formData)
    }

    if (res.success) {
      onOpenChange(false)
      onSuccess()
    } else {
      alert(`Gagal ${mode === "edit" ? "mengupdate" : "menambahkan"} soal: ` + (res.error || 'Unknown error'))
    }
  }

  function addOption() {
    setOptions([...options, { optionText: "", isCorrect: false }])
  }

  function removeOption(index: number) {
    setOptions(options.filter((_, i) => i !== index))
  }

  function updateOption(index: number, field: string, value: any) {
    const newOptions = [...options]
    newOptions[index] = { ...newOptions[index], [field]: value }
    
    // If setting correct answer for multiple choice (single answer usually, but let's support multiple correct if needed or just one)
    // For now assuming multiple correct is allowed or handled by backend logic if needed.
    // But usually radio button behavior is expected for single choice. 
    // The current UI uses checkboxes so multiple correct is implied possible.
    
    setOptions(newOptions)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit Soal" : "Tambah Soal Baru"}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question">Pertanyaan *</Label>
            <Textarea 
              id="question" 
              name="question" 
              required 
              placeholder="Masukkan pertanyaan..."
              rows={3}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <ImageUpload
              value={imageUrl}
              onChange={setImageUrl}
              onRemove={() => setImageUrl("")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipe Soal *</Label>
              <Select value={type} onValueChange={setType} name="type">
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
              <Label htmlFor="difficulty">Tingkat Kesulitan *</Label>
              <Select value={difficulty} onValueChange={setDifficulty} name="difficulty">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EASY">Mudah</SelectItem>
                  <SelectItem value="MEDIUM">Sedang</SelectItem>
                  <SelectItem value="HARD">Sulit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoryId">Kategori</Label>
              <Select name="categoryId" value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori (opsional)" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="points">Poin *</Label>
              <Input 
                id="points" 
                name="points" 
                type="number"
                value={points}
                onChange={(e) => setPoints(parseInt(e.target.value))}
                min={1}
                required 
              />
            </div>
          </div>

          {(type === "MULTIPLE_CHOICE" || type === "TRUE_FALSE") && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Pilihan Jawaban *</Label>
                {type === "MULTIPLE_CHOICE" && (
                  <Button type="button" size="sm" variant="outline" onClick={addOption}>
                    <Plus className="h-4 w-4 mr-1" />
                    Tambah Pilihan
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      placeholder={`Pilihan ${String.fromCharCode(65 + index)}`}
                      value={option.optionText}
                      onChange={(e) => updateOption(index, 'optionText', e.target.value)}
                      required
                    />
                    <label className="flex items-center gap-2 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={option.isCorrect}
                        onChange={(e) => updateOption(index, 'isCorrect', e.target.checked)}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">Benar</span>
                    </label>
                    {type === "MULTIPLE_CHOICE" && options.length > 2 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeOption(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="explanation">Pembahasan (Opsional)</Label>
            <Textarea 
              id="explanation" 
              name="explanation" 
              placeholder="Penjelasan jawaban yang benar..."
              rows={2}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit">
              {mode === "edit" ? "Simpan Perubahan" : "Simpan Soal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

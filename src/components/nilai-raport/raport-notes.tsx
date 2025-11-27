'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Save, Lightbulb, AlertCircle, CheckCircle2 } from "lucide-react"
import { useState } from "react"

interface RaportNotesProps {
  studentId: string
  studentName: string
  nilaiData: any[]
  initialNotes?: {
    academicNotes?: string
    behaviorNotes?: string
    recommendations?: string
  }
  onSaveNotes?: (notes: {
    academicNotes: string
    behaviorNotes: string
    recommendations: string
  }) => Promise<void>
}

export function RaportNotes({
  studentId,
  studentName,
  nilaiData,
  initialNotes,
  onSaveNotes
}: RaportNotesProps) {
  const [academicNotes, setAcademicNotes] = useState(initialNotes?.academicNotes || '')
  const [behaviorNotes, setBehaviorNotes] = useState(initialNotes?.behaviorNotes || '')
  const [recommendations, setRecommendations] = useState(initialNotes?.recommendations || '')
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')

  // Auto-generate suggestions based on performance
  const generateSuggestions = () => {
    const mapelNilai = nilaiData.filter(n => n.category === 'UJIAN' || n.category === 'TUGAS')
    const allScores = mapelNilai.filter(n => n.score).map(n => n.score)
    const overallAverage = allScores.length > 0 
      ? allScores.reduce((a, b) => a + b, 0) / allScores.length 
      : 0

    let suggestions: string[] = []

    if (overallAverage >= 9) {
      suggestions.push("Prestasi sangat memuaskan. Pertahankan konsistensi belajar.")
      suggestions.push("Dapat menjadi tutor sebaya untuk membantu teman-teman yang memerlukan.")
    } else if (overallAverage >= 8) {
      suggestions.push("Prestasi baik. Tingkatkan lagi untuk mencapai nilai maksimal.")
      suggestions.push("Fokus pada mata pelajaran yang masih di bawah rata-rata.")
    } else if (overallAverage >= 7) {
      suggestions.push("Perlu peningkatan pemahaman materi.")
      suggestions.push("Disarankan untuk aktif bertanya kepada ustadz saat belum paham.")
    } else {
      suggestions.push("Memerlukan perhatian khusus dan bimbingan intensif.")
      suggestions.push("Orang tua diharapkan lebih aktif memantau perkembangan belajar.")
    }

    // Check for weak subjects
    const mapelStats = mapelNilai.reduce((acc, nilai) => {
      const mapelName = nilai.mapel?.name || 'Unknown'
      if (!acc[mapelName]) {
        acc[mapelName] = { scores: [], total: 0, count: 0 }
      }
      if (nilai.score) {
        acc[mapelName].scores.push(nilai.score)
        acc[mapelName].total += nilai.score
        acc[mapelName].count += 1
      }
      return acc
    }, {} as Record<string, { scores: number[]; total: number; count: number }>)

    const weakSubjects = Object.entries(mapelStats)
      .map(([name, stats]) => ({
        name,
        average: stats.count > 0 ? stats.total / stats.count : 0
      }))
      .filter(item => item.average < 7)

    if (weakSubjects.length > 0) {
      suggestions.push(`Perlu perbaikan di mata pelajaran: ${weakSubjects.map(s => s.name).join(', ')}.`)
    }

    return suggestions
  }

  const suggestions = generateSuggestions()

  const handleSave = async () => {
    if (!onSaveNotes) return

    setIsSaving(true)
    setSaveStatus('saving')

    try {
      await onSaveNotes({
        academicNotes,
        behaviorNotes,
        recommendations
      })
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      console.error('Error saving notes:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleUseSuggestion = (suggestion: string) => {
    setRecommendations(prev => 
      prev ? `${prev}\n• ${suggestion}` : `• ${suggestion}`
    )
  }

  return (
    <div className="space-y-4">
      {/* Auto Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Saran Otomatis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground mb-3">
            Klik untuk menambahkan ke catatan rekomendasi
          </p>
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="flex items-start gap-2 p-2 hover:bg-muted/50 rounded cursor-pointer transition-colors"
              onClick={() => handleUseSuggestion(suggestion)}
            >
              <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm flex-1">{suggestion}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Academic Performance Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Catatan Prestasi Akademik
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Tulis catatan tentang prestasi akademik santri..."
            value={academicNotes}
            onChange={(e) => setAcademicNotes(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Contoh: Menunjukkan peningkatan signifikan di semester ini, aktif bertanya, dll.
          </p>
        </CardContent>
      </Card>

      {/* Behavior Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Catatan Sikap & Perilaku
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Tulis catatan tentang sikap dan perilaku santri..."
            value={behaviorNotes}
            onChange={(e) => setBehaviorNotes(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Contoh: Santun dalam bertutur kata, disiplin mengikuti kegiatan, dll.
          </p>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Rekomendasi & Saran
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Tulis rekomendasi untuk perbaikan dan peningkatan..."
            value={recommendations}
            onChange={(e) => setRecommendations(e.target.value)}
            rows={5}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Contoh: Tingkatkan kehadiran di kajian tambahan, fokus pada matematika, dll.
          </p>
        </CardContent>
      </Card>

      {/* Save Button */}
      {onSaveNotes && (
        <div className="flex items-center justify-between">
          <div>
            {saveStatus === 'success' && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm">Catatan berhasil disimpan</span>
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Gagal menyimpan catatan</span>
              </div>
            )}
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="lg"
          >
            {isSaving ? (
              <>
                <Save className="h-4 w-4 mr-2 animate-pulse" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Simpan Catatan
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}





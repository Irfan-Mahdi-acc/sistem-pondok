'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  RotateCcw, 
  Save, 
  Info, 
  Plus,
  Trash2,
  AlertCircle 
} from "lucide-react"
import {
  getGradeWeights,
  updateGradeWeight,
  batchUpdateGradeWeights,
  resetToDefaultWeights,
  getExamTypeLabel,
  DEFAULT_GRADE_WEIGHTS
} from "@/actions/grade-weight-actions"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { toast } from 'sonner'

interface GradeWeight {
  id: string
  examType: string
  weight: number
  order: number
  isActive: boolean
}

interface GradeWeightSettingsProps {
  lembagaId: string
  lembagaName: string
}

export function GradeWeightSettings({ lembagaId, lembagaName }: GradeWeightSettingsProps) {
  const [weights, setWeights] = useState<GradeWeight[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    loadWeights()
  }, [lembagaId])

  const loadWeights = async () => {
    try {
      setIsLoading(true)
      const data = await getGradeWeights(lembagaId)
      setWeights(data)
      setHasChanges(false)
    } catch (error) {
      console.error('Error loading weights:', error)
      toast.error('Gagal memuat bobot nilai')
    } finally {
      setIsLoading(false)
    }
  }

  const handleWeightChange = (id: string, newWeight: number) => {
    setWeights(prev => 
      prev.map(w => w.id === id ? { ...w, weight: newWeight } : w)
    )
    setHasChanges(true)
  }

  const handleActiveToggle = (id: string) => {
    setWeights(prev => 
      prev.map(w => w.id === id ? { ...w, isActive: !w.isActive } : w)
    )
    setHasChanges(true)
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await batchUpdateGradeWeights(lembagaId, weights)
      toast.success('Bobot nilai berhasil disimpan')
      setHasChanges(false)
    } catch (error) {
      console.error('Error saving weights:', error)
      toast.error('Gagal menyimpan bobot nilai')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async () => {
    if (!confirm('Reset ke bobot default? Semua perubahan akan hilang.')) return

    try {
      setIsSaving(true)
      await resetToDefaultWeights(lembagaId)
      await loadWeights()
      toast.success('Bobot nilai direset ke default')
    } catch (error) {
      console.error('Error resetting weights:', error)
      toast.error('Gagal reset bobot nilai')
    } finally {
      setIsSaving(false)
    }
  }

  // Calculate example weighted average
  const calculateExample = () => {
    const examples = [
      { type: 'UAS', score: 90 },
      { type: 'UTS', score: 85 },
      { type: 'HARIAN', score: 80 }
    ]

    let totalWeighted = 0
    let totalWeight = 0

    examples.forEach(ex => {
      const weight = weights.find(w => w.examType === ex.type && w.isActive)?.weight || 1.0
      totalWeighted += ex.score * weight
      totalWeight += weight
    })

    return totalWeight > 0 ? (totalWeighted / totalWeight).toFixed(2) : '0.00'
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Pengaturan Bobot Nilai
            <Badge variant="outline">{lembagaName}</Badge>
          </CardTitle>
          <CardDescription>
            Atur bobot perhitungan nilai untuk berbagai jenis ujian. 
            Nilai akhir akan dihitung berdasarkan rata-rata tertimbang (weighted average).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Cara Kerja Bobot Nilai</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>
                • <strong>Bobot 1.0</strong> = Nilai normal (tidak dikali)
              </p>
              <p>
                • <strong>Bobot 2.0</strong> = Nilai dihitung 2× lipat (lebih penting)
              </p>
              <p>
                • <strong>Bobot 0.5</strong> = Nilai dihitung ½× (kurang penting)
              </p>
              <p className="mt-2 text-sm">
                <strong>Contoh:</strong> Jika santri mendapat UAS=90 (bobot 2.0), UTS=85 (bobot 1.5), Harian=80 (bobot 1.0), 
                maka nilai akhir = (90×2.0 + 85×1.5 + 80×1.0) / (2.0 + 1.5 + 1.0) = {calculateExample()}
              </p>
            </AlertDescription>
          </Alert>

          {/* Weights Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Aktif</TableHead>
                  <TableHead>Jenis Ujian</TableHead>
                  <TableHead className="w-32">Bobot</TableHead>
                  <TableHead className="w-48">Keterangan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {weights.map((weight) => (
                  <TableRow key={weight.id}>
                    <TableCell>
                      <Switch
                        checked={weight.isActive}
                        onCheckedChange={() => handleActiveToggle(weight.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {getExamTypeLabel(weight.examType)}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={weight.weight}
                        onChange={(e) => handleWeightChange(weight.id, parseFloat(e.target.value) || 0)}
                        disabled={!weight.isActive}
                        className="w-24"
                      />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {weight.weight === 1.0 && 'Normal'}
                      {weight.weight > 1.0 && `${weight.weight}× lebih penting`}
                      {weight.weight < 1.0 && weight.weight > 0 && `${weight.weight}× kurang penting`}
                      {!weight.isActive && <Badge variant="outline" className="ml-2">Tidak Aktif</Badge>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Example Calculation */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-base">Contoh Perhitungan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p className="font-medium">Nilai Santri:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>UAS: 90 (bobot {weights.find(w => w.examType === 'UAS')?.weight || 1.0})</li>
                  <li>UTS: 85 (bobot {weights.find(w => w.examType === 'UTS')?.weight || 1.0})</li>
                  <li>Harian: 80 (bobot {weights.find(w => w.examType === 'HARIAN')?.weight || 1.0})</li>
                </ul>
                <p className="font-semibold text-lg pt-2">
                  Nilai Akhir: {calculateExample()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isSaving}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset ke Default
            </Button>

            <div className="flex gap-2">
              {hasChanges && (
                <Badge variant="secondary" className="self-center">
                  Ada perubahan belum disimpan
                </Badge>
              )}
              <Button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Default Weights Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bobot Default</CardTitle>
          <CardDescription>
            Referensi bobot nilai yang umum digunakan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {DEFAULT_GRADE_WEIGHTS.map((weight) => (
              <div key={weight.examType} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">{weight.label}</span>
                <Badge>{weight.weight}×</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Warning */}
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Perhatian</AlertTitle>
        <AlertDescription>
          Perubahan bobot nilai akan mempengaruhi semua perhitungan nilai di lembaga ini. 
          Nilai yang sudah ada akan dihitung ulang secara otomatis menggunakan bobot baru.
        </AlertDescription>
      </Alert>
    </div>
  )
}





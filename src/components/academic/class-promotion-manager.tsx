'use client'

import { useState, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { performClassPromotion, promoteEntireClass, undoPromotion } from "@/actions/class-promotion-actions"
import { ArrowRight, GraduationCap, Loader2, CheckCircle2, XCircle, RotateCcw, Users, AlertCircle } from "lucide-react"

type Kelas = {
  id: string
  name: string
  lembaga: { id: string; name: string }
  nextKelas: { id: string; name: string; lembaga: { name: string } } | null
  nextKelasId: string | null
  santris: { id: string; nis: string; nama: string; status: string }[]
  _count: { santris: number }
}

type AcademicYear = {
  id: string
  name: string
  isActive: boolean
}

type Lembaga = {
  id: string
  name: string
}

type HistoryRecord = {
  id: string
  santriId: string
  kelasId: string
  academicYear: string
  status: string
  startDate: Date
  endDate: Date | null
  santri: { id: string; nis: string; nama: string }
  kelas: { id: string; name: string; lembaga: { name: string } }
}

type UnprocessedStudent = {
  id: string
  nis: string
  nama: string
  kelas: { id: string; name: string; lembaga: { name: string }; nextKelas: { id: string; name: string } | null } | null
  lembaga: { name: string }
}

interface ClassPromotionManagerProps {
  classes: Kelas[]
  academicYears: AcademicYear[]
  lembagaList: Lembaga[]
  activeYear: AcademicYear | null | undefined
  unprocessedStudents: UnprocessedStudent[]
  history: HistoryRecord[]
}

type PromotionStatus = 'NAIK' | 'LULUS' | 'TINGGAL' | 'PINDAH' | 'KELUAR'

export function ClassPromotionManager({
  classes,
  academicYears,
  lembagaList,
  activeYear,
  unprocessedStudents,
  history
}: ClassPromotionManagerProps) {
  const [selectedLembaga, setSelectedLembaga] = useState<string>('')
  const [selectedKelas, setSelectedKelas] = useState<string>('')
  const [selectedYear, setSelectedYear] = useState<string>(activeYear?.name || '')
  const [selectedSantris, setSelectedSantris] = useState<Set<string>>(new Set())
  const [santriStatuses, setSantriStatuses] = useState<Record<string, PromotionStatus>>({})
  const [loading, setLoading] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  // Filter classes by lembaga
  const filteredClasses = useMemo(() => {
    if (!selectedLembaga) return classes
    return classes.filter(k => k.lembaga.id === selectedLembaga)
  }, [classes, selectedLembaga])

  // Get current selected class
  const currentKelas = useMemo(() => {
    return classes.find(k => k.id === selectedKelas)
  }, [classes, selectedKelas])

  // Initialize santri statuses when class changes
  const handleKelasChange = (kelasId: string) => {
    setSelectedKelas(kelasId)
    setSelectedSantris(new Set())
    
    const kelas = classes.find(k => k.id === kelasId)
    if (kelas) {
      const defaultStatuses: Record<string, PromotionStatus> = {}
      kelas.santris.forEach(s => {
        // Default to NAIK if has next class, LULUS if terminal
        defaultStatuses[s.id] = kelas.nextKelasId ? 'NAIK' : 'LULUS'
      })
      setSantriStatuses(defaultStatuses)
    }
  }

  // Toggle select all
  const toggleSelectAll = () => {
    if (!currentKelas) return
    
    if (selectedSantris.size === currentKelas.santris.length) {
      setSelectedSantris(new Set())
    } else {
      setSelectedSantris(new Set(currentKelas.santris.map(s => s.id)))
    }
  }

  // Toggle single santri
  const toggleSantri = (santriId: string) => {
    const newSelected = new Set(selectedSantris)
    if (newSelected.has(santriId)) {
      newSelected.delete(santriId)
    } else {
      newSelected.add(santriId)
    }
    setSelectedSantris(newSelected)
  }

  // Change status for a santri
  const changeStatus = (santriId: string, status: PromotionStatus) => {
    setSantriStatuses(prev => ({ ...prev, [santriId]: status }))
  }

  // Process promotion
  const handlePromotion = async () => {
    if (!currentKelas || selectedSantris.size === 0 || !selectedYear) return

    setLoading(true)
    setResult(null)

    const promotionData = Array.from(selectedSantris).map(santriId => ({
      santriId,
      fromKelasId: currentKelas.id,
      toKelasId: santriStatuses[santriId] === 'NAIK' ? currentKelas.nextKelasId : null,
      status: santriStatuses[santriId]
    }))

    const response = await performClassPromotion(selectedYear, promotionData)

    if (response.success && response.results) {
      setResult({
        success: true,
        message: `Berhasil: ${response.results.promoted} naik kelas, ${response.results.graduated} lulus, ${response.results.retained} tinggal kelas`
      })
      // Reset selection
      setSelectedSantris(new Set())
    } else {
      setResult({
        success: false,
        message: response.error || 'Terjadi kesalahan'
      })
    }

    setLoading(false)
    setConfirmDialog(false)
  }

  // Promote entire class
  const handlePromoteAll = async () => {
    if (!currentKelas || !selectedYear) return

    setLoading(true)
    setResult(null)

    const response = await promoteEntireClass(currentKelas.id, selectedYear)

    if (response.success && response.results) {
      setResult({
        success: true,
        message: `Berhasil: ${response.results.promoted} naik kelas, ${response.results.graduated} lulus`
      })
    } else {
      setResult({
        success: false,
        message: response.error || 'Terjadi kesalahan'
      })
    }

    setLoading(false)
  }

  // Handle undo
  const handleUndo = async (historyId: string) => {
    const response = await undoPromotion(historyId)
    if (response.success) {
      setResult({ success: true, message: 'Berhasil membatalkan kenaikan kelas' })
    } else {
      setResult({ success: false, message: response.error || 'Gagal membatalkan' })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NAIK':
        return <Badge className="bg-blue-500">Naik Kelas</Badge>
      case 'LULUS':
        return <Badge className="bg-green-500">Lulus</Badge>
      case 'TINGGAL':
        return <Badge variant="secondary">Tinggal Kelas</Badge>
      case 'PINDAH':
        return <Badge variant="outline">Pindah</Badge>
      case 'KELUAR':
        return <Badge variant="destructive">Keluar</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="process" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="process">Proses Kenaikan</TabsTrigger>
          <TabsTrigger value="history">Riwayat ({history.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="process" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="w-48">
              <label className="text-sm font-medium mb-1 block">Tahun Ajaran</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tahun ajaran" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map(year => (
                    <SelectItem key={year.id} value={year.name}>
                      {year.name} {year.isActive && '(Aktif)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-48">
              <label className="text-sm font-medium mb-1 block">Lembaga</label>
              <Select value={selectedLembaga || 'all'} onValueChange={(v) => {
                setSelectedLembaga(v === 'all' ? '' : v)
                setSelectedKelas('')
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua lembaga" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Lembaga</SelectItem>
                  {lembagaList.map(l => (
                    <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-64">
              <label className="text-sm font-medium mb-1 block">Kelas</label>
              <Select value={selectedKelas} onValueChange={handleKelasChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kelas" />
                </SelectTrigger>
                <SelectContent>
                  {filteredClasses.map(k => (
                    <SelectItem key={k.id} value={k.id}>
                      {k.name} - {k.lembaga.name} ({k.santris.length} santri)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}

          {/* Selected Class Info */}
          {currentKelas && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{currentKelas.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{currentKelas.lembaga.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentKelas.nextKelas ? (
                      <div className="flex items-center gap-2 text-sm">
                        <span>Tujuan:</span>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <ArrowRight className="h-3 w-3" />
                          {currentKelas.nextKelas.name}
                        </Badge>
                      </div>
                    ) : (
                      <Badge className="bg-green-500 flex items-center gap-1">
                        <GraduationCap className="h-3 w-3" />
                        Kelas Akhir (Lulus)
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {currentKelas.santris.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Tidak ada santri aktif di kelas ini</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          checked={selectedSantris.size === currentKelas.santris.length}
                          onCheckedChange={toggleSelectAll}
                        />
                        <span className="text-sm">
                          Pilih Semua ({selectedSantris.size}/{currentKelas.santris.length})
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handlePromoteAll}
                          disabled={loading || !selectedYear}
                        >
                          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                          Naikkan Semua
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => setConfirmDialog(true)}
                          disabled={loading || selectedSantris.size === 0 || !selectedYear}
                        >
                          Proses Terpilih ({selectedSantris.size})
                        </Button>
                      </div>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12"></TableHead>
                          <TableHead>NIS</TableHead>
                          <TableHead>Nama</TableHead>
                          <TableHead className="w-40">Status Kenaikan</TableHead>
                          <TableHead>Tujuan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentKelas.santris.map(santri => (
                          <TableRow key={santri.id}>
                            <TableCell>
                              <Checkbox 
                                checked={selectedSantris.has(santri.id)}
                                onCheckedChange={() => toggleSantri(santri.id)}
                              />
                            </TableCell>
                            <TableCell className="font-mono">{santri.nis}</TableCell>
                            <TableCell>{santri.nama}</TableCell>
                            <TableCell>
                              <Select 
                                value={santriStatuses[santri.id] || 'NAIK'} 
                                onValueChange={(v) => changeStatus(santri.id, v as PromotionStatus)}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {currentKelas.nextKelas && (
                                    <SelectItem value="NAIK">Naik Kelas</SelectItem>
                                  )}
                                  <SelectItem value="LULUS">Lulus</SelectItem>
                                  <SelectItem value="TINGGAL">Tinggal Kelas</SelectItem>
                                  <SelectItem value="PINDAH">Pindah</SelectItem>
                                  <SelectItem value="KELUAR">Keluar</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              {santriStatuses[santri.id] === 'NAIK' && currentKelas.nextKelas ? (
                                <span className="text-blue-600">{currentKelas.nextKelas.name}</span>
                              ) : santriStatuses[santri.id] === 'LULUS' ? (
                                <span className="text-green-600">Alumni</span>
                              ) : santriStatuses[santri.id] === 'TINGGAL' ? (
                                <span className="text-muted-foreground">Tetap di {currentKelas.name}</span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {!currentKelas && (
            <div className="text-center py-12 text-muted-foreground border rounded-lg">
              <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Pilih kelas untuk memulai proses kenaikan</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {history.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border rounded-lg">
              <p>Belum ada riwayat kenaikan kelas untuk tahun ajaran ini</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>NIS</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Dari Kelas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="w-24">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map(record => (
                  <TableRow key={record.id}>
                    <TableCell className="font-mono">{record.santri.nis}</TableCell>
                    <TableCell>{record.santri.nama}</TableCell>
                    <TableCell>
                      {record.kelas.name}
                      <span className="text-muted-foreground text-xs ml-1">
                        ({record.kelas.lembaga.name})
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell>
                      {record.endDate ? new Date(record.endDate).toLocaleDateString('id-ID') : '-'}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleUndo(record.id)}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog} onOpenChange={setConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Kenaikan Kelas</AlertDialogTitle>
            <AlertDialogDescription>
              Anda akan memproses kenaikan kelas untuk {selectedSantris.size} santri.
              {currentKelas?.nextKelas && (
                <span className="block mt-2">
                  Santri dengan status "Naik Kelas" akan dipindahkan ke <strong>{currentKelas.nextKelas.name}</strong>
                </span>
              )}
              <span className="block mt-2 text-orange-600">
                Tindakan ini dapat dibatalkan melalui tab Riwayat.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handlePromotion} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Proses Kenaikan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}


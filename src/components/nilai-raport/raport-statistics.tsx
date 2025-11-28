'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Award, Target, BarChart3 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface RaportStatisticsProps {
  nilaiData: any[]
  ujianHifdzData: any[]
  categories: any[]
  ranking?: number
  totalStudents?: number
}

export function RaportStatistics({ 
  nilaiData, 
  ujianHifdzData,
  categories,
  ranking, 
  totalStudents 
}: RaportStatisticsProps) {
  // Analyze mapel nilai
  const mapelNilai = nilaiData.filter(n => n.category === 'UJIAN' || n.category === 'TUGAS')
  
  // Group by mapel and calculate statistics
  const mapelStats = mapelNilai.reduce((acc, nilai) => {
    const mapelName = nilai.mapel?.name || 'Unknown'
    if (!acc[mapelName]) {
      acc[mapelName] = {
        scores: [],
        total: 0,
        count: 0
      }
    }
    if (nilai.score) {
      acc[mapelName].scores.push(nilai.score)
      acc[mapelName].total += nilai.score
      acc[mapelName].count += 1
    }
    return acc
  }, {} as Record<string, { scores: number[]; total: number; count: number }>)

  // Calculate averages and find highest/lowest
  const mapelAverages = (Object.entries(mapelStats) as [string, { scores: number[]; total: number; count: number }][]).map(([mapelName, stats]) => ({
    mapelName,
    average: stats.count > 0 ? stats.total / stats.count : 0,
    highest: Math.max(...stats.scores),
    lowest: Math.min(...stats.scores),
    count: stats.count
  })).sort((a, b) => b.average - a.average)

  const highestMapel = mapelAverages[0]
  const lowestMapel = mapelAverages[mapelAverages.length - 1]

  // Overall statistics
  const allScores = mapelNilai.filter(n => n.score).map(n => n.score)
  const overallAverage = allScores.length > 0 
    ? allScores.reduce((a, b) => a + b, 0) / allScores.length 
    : 0
  const highestScore = allScores.length > 0 ? Math.max(...allScores) : 0
  const lowestScore = allScores.length > 0 ? Math.min(...allScores) : 0

  // Count by predicate
  const predicateCounts = {
    A: 0, // >= 9
    B: 0, // >= 8
    C: 0, // >= 7
    D: 0, // >= 6
    E: 0  // < 6
  }

  mapelAverages.forEach(item => {
    if (item.average >= 9) predicateCounts.A++
    else if (item.average >= 8) predicateCounts.B++
    else if (item.average >= 7) predicateCounts.C++
    else if (item.average >= 6) predicateCounts.D++
    else predicateCounts.E++
  })

  return (
    <div className="space-y-4">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rata-rata
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold">{overallAverage.toFixed(2)}</p>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Nilai Tertinggi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-green-600">{highestScore.toFixed(2)}</p>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Nilai Terendah
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-orange-600">{lowestScore.toFixed(2)}</p>
              <TrendingDown className="h-4 w-4 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        {ranking && totalStudents && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Peringkat Kelas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold">{ranking}</p>
                <p className="text-sm text-muted-foreground">dari {totalStudents}</p>
                <Award className="h-4 w-4 text-amber-500" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Performance by Subject */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Performa per Mata Pelajaran</CardTitle>
        </CardHeader>
        <CardContent>
          {mapelAverages.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada data nilai</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mata Pelajaran</TableHead>
                  <TableHead className="text-center">Rata-rata</TableHead>
                  <TableHead className="text-center">Tertinggi</TableHead>
                  <TableHead className="text-center">Terendah</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mapelAverages.map((item) => (
                  <TableRow key={item.mapelName}>
                    <TableCell className="font-medium">{item.mapelName}</TableCell>
                    <TableCell className="text-center font-semibold">
                      {item.average.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center text-green-600">
                      {item.highest}
                    </TableCell>
                    <TableCell className="text-center text-orange-600">
                      {item.lowest}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.average >= 9 && <Badge className="bg-green-600">Sangat Baik</Badge>}
                      {item.average >= 8 && item.average < 9 && <Badge className="bg-blue-600">Baik</Badge>}
                      {item.average >= 7 && item.average < 8 && <Badge className="bg-yellow-600">Cukup</Badge>}
                      {item.average >= 6 && item.average < 7 && <Badge className="bg-orange-600">Kurang</Badge>}
                      {item.average < 6 && <Badge variant="destructive">Perlu Perbaikan</Badge>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Achievement Summary */}
      {highestMapel && lowestMapel && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ringkasan Capaian</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-green-900 dark:text-green-100">Prestasi Terbaik</p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {highestMapel.mapelName} dengan rata-rata {highestMapel.average.toFixed(2)}
                </p>
              </div>
            </div>

            {lowestMapel.average < 7 && (
              <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                <Target className="h-5 w-5 text-orange-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-orange-900 dark:text-orange-100">Perlu Peningkatan</p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    {lowestMapel.mapelName} dengan rata-rata {lowestMapel.average.toFixed(2)}
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                    Rekomendasi: Tambah jam belajar dan konsultasi dengan ustadz pengampu
                  </p>
                </div>
              </div>
            )}

            {/* Predicate Distribution */}
            <div className="pt-3 border-t">
              <p className="text-sm font-semibold mb-2">Distribusi Predikat</p>
              <div className="grid grid-cols-5 gap-2">
                <div className="text-center p-2 bg-green-50 dark:bg-green-950 rounded">
                  <p className="text-2xl font-bold text-green-600">{predicateCounts.A}</p>
                  <p className="text-xs text-green-700 dark:text-green-300">A</p>
                </div>
                <div className="text-center p-2 bg-blue-50 dark:bg-blue-950 rounded">
                  <p className="text-2xl font-bold text-blue-600">{predicateCounts.B}</p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">B</p>
                </div>
                <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-950 rounded">
                  <p className="text-2xl font-bold text-yellow-600">{predicateCounts.C}</p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">C</p>
                </div>
                <div className="text-center p-2 bg-orange-50 dark:bg-orange-950 rounded">
                  <p className="text-2xl font-bold text-orange-600">{predicateCounts.D}</p>
                  <p className="text-xs text-orange-700 dark:text-orange-300">D</p>
                </div>
                <div className="text-center p-2 bg-red-50 dark:bg-red-950 rounded">
                  <p className="text-2xl font-bold text-red-600">{predicateCounts.E}</p>
                  <p className="text-xs text-red-700 dark:text-red-300">E</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tahfidz Progress */}
      {ujianHifdzData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Progress Tahfidz</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Ujian Hifdz:</span>
                <span className="font-semibold">{ujianHifdzData.length} kali</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Ayat:</span>
                <span className="font-semibold">
                  {ujianHifdzData.reduce((sum, h) => sum + (h.ayatEnd - h.ayatStart + 1), 0)} ayat
                </span>
              </div>
              {ujianHifdzData.length > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Rata-rata Nilai:</span>
                  <span className="font-semibold">
                    {(ujianHifdzData.reduce((sum, h) => sum + (parseFloat(h.grade) || 0), 0) / ujianHifdzData.length).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}






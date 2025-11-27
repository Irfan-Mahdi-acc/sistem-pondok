'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download, Filter } from "lucide-react"
import { useState, useMemo } from "react"

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

export function JadwalPelajaranTable({
  jadwals,
  jamPelajaran,
  ustadzList,
  kelasList,
  lembagaName
}: {
  jadwals: any[]
  jamPelajaran: any[]
  ustadzList: any[]
  kelasList: any[]
  lembagaName: string
}) {
  const [filterKelas, setFilterKelas] = useState<string>('all')
  const [filterUstadz, setFilterUstadz] = useState<string>('all')
  const [filterMapel, setFilterMapel] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Get unique mapels from jadwals
  const uniqueMapels = useMemo(() => {
    const mapels = jadwals
      .filter(j => j.mapel)
      .map(j => j.mapel)
    const unique = Array.from(new Map(mapels.map(m => [m.id, m])).values())
    return unique
  }, [jadwals])

  // Filter jadwals based on selected filters
  const filteredJadwals = useMemo(() => {
    return jadwals.filter(jadwal => {
      if (filterKelas !== 'all' && jadwal.kelasId !== filterKelas) return false
      if (filterMapel !== 'all' && jadwal.mapelId !== filterMapel) return false
      if (filterUstadz !== 'all') {
        if (!jadwal.mapel || jadwal.mapel.ustadzId !== filterUstadz) return false
      }
      return true
    })
  }, [jadwals, filterKelas, filterMapel, filterUstadz])

  // Group jadwals by day
  const jadwalByDay = useMemo(() => {
    return DAYS.reduce((acc, day) => {
      acc[day] = filteredJadwals
        .filter(j => j.day === day)
        .sort((a, b) => {
          const jamA = jamPelajaran.find(jp => jp.id === a.jamPelajaranId)
          const jamB = jamPelajaran.find(jp => jp.id === b.jamPelajaranId)
          return (jamA?.startTime || '').localeCompare(jamB?.startTime || '')
        })
      return acc
    }, {} as Record<string, any[]>)
  }, [filteredJadwals, jamPelajaran])

  const handleDownloadPDF = () => {
    // Create printable content
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Jadwal Pelajaran - ${lembagaName}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { text-align: center; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .day-cell { font-weight: bold; background-color: #f9f9f9; }
          .empty { color: #999; font-style: italic; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <h1>Jadwal Pelajaran ${lembagaName}</h1>
        ${filterKelas !== 'all' ? `<p><strong>Kelas:</strong> ${kelasList.find(k => k.id === filterKelas)?.name}</p>` : ''}
        ${filterUstadz !== 'all' ? `<p><strong>Ustadz:</strong> ${ustadzList.find(u => u.id === filterUstadz)?.user.name}</p>` : ''}
        ${filterMapel !== 'all' ? `<p><strong>Mapel:</strong> ${uniqueMapels.find(m => m.id === filterMapel)?.name}</p>` : ''}
        <table>
          <thead>
            <tr>
              <th>Hari</th>
              <th>Jam</th>
              <th>Kelas</th>
              <th>Mata Pelajaran</th>
              <th>Ustadz</th>
            </tr>
          </thead>
          <tbody>
            ${DAYS.map(day => {
              const dayJadwals = jadwalByDay[day]
              if (dayJadwals.length === 0) {
                return `
                  <tr>
                    <td class="day-cell">${day}</td>
                    <td colspan="4" class="empty">Tidak ada jadwal</td>
                  </tr>
                `
              }
              return dayJadwals.map((jadwal, idx) => {
                const jam = jamPelajaran.find(jp => jp.id === jadwal.jamPelajaranId)
                const ustadz = jadwal.mapel?.ustadz
                return `
                  <tr>
                    ${idx === 0 ? `<td class="day-cell" rowspan="${dayJadwals.length}">${day}</td>` : ''}
                    <td>${jam?.name} (${jam?.startTime} - ${jam?.endTime})</td>
                    <td>${jadwal.kelas.name}</td>
                    <td>${jadwal.mapel ? jadwal.mapel.name : '<span class="empty">Istirahat</span>'}</td>
                    <td>${ustadz ? ustadz.user.name : '-'}</td>
                  </tr>
                `
              }).join('')
            }).join('')}
          </tbody>
        </table>
        <p style="text-align: center; color: #666; font-size: 12px;">
          Dicetak pada: ${new Date().toLocaleString('id-ID')}
        </p>
      </body>
      </html>
    `

    // Open print window
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
      }, 250)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Jadwal Pelajaran Mingguan</CardTitle>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowFilters(!showFilters)} 
              size="sm" 
              variant="outline"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button onClick={handleDownloadPDF} size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
        
        {/* Filters - Conditional Display */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Filter Kelas</label>
              <Select value={filterKelas} onValueChange={setFilterKelas}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kelas</SelectItem>
                  {kelasList.map(k => (
                    <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Filter Ustadz</label>
              <Select value={filterUstadz} onValueChange={setFilterUstadz}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Ustadz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Ustadz</SelectItem>
                  {ustadzList.map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Filter Mapel</label>
              <Select value={filterMapel} onValueChange={setFilterMapel}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Mapel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Mapel</SelectItem>
                  {uniqueMapels.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Hari</TableHead>
                <TableHead className="w-[150px]">Jam</TableHead>
                <TableHead className="w-[120px]">Kelas</TableHead>
                <TableHead>Mata Pelajaran</TableHead>
                <TableHead>Ustadz</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DAYS.map(day => {
                const dayJadwals = jadwalByDay[day]
                if (dayJadwals.length === 0) {
                  return (
                    <TableRow key={day}>
                      <TableCell className="font-medium">{day}</TableCell>
                      <TableCell colSpan={4} className="text-muted-foreground">
                        Tidak ada jadwal
                      </TableCell>
                    </TableRow>
                  )
                }
                
                return dayJadwals.map((jadwal, idx) => {
                  const jam = jamPelajaran.find(jp => jp.id === jadwal.jamPelajaranId)
                  const ustadz = jadwal.mapel?.ustadz
                  return (
                    <TableRow key={jadwal.id}>
                      {idx === 0 && (
                        <TableCell className="font-medium" rowSpan={dayJadwals.length}>
                          {day}
                        </TableCell>
                      )}
                      <TableCell>
                        {jam?.name} ({jam?.startTime} - {jam?.endTime})
                      </TableCell>
                      <TableCell>{jadwal.kelas.name}</TableCell>
                      <TableCell>
                        {jadwal.mapel ? jadwal.mapel.name : <span className="text-muted-foreground">Istirahat</span>}
                      </TableCell>
                      <TableCell>
                        {ustadz ? ustadz.user.name : '-'}
                      </TableCell>
                    </TableRow>
                  )
                })
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

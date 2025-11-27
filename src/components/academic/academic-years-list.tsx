'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2, CheckCircle, XCircle } from "lucide-react"
import { deleteAcademicYear, setActiveAcademicYear, setInactiveAcademicYear } from "@/actions/academic-year-actions"
import { Badge } from "@/components/ui/badge"

export default function AcademicYearsList({ academicYears }: { academicYears: any[] }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>Tanggal Mulai</TableHead>
            <TableHead>Tanggal Selesai</TableHead>
            <TableHead>Durasi</TableHead>
            <TableHead>Lembaga</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {academicYears.map((year) => {
            const startDate = new Date(year.startDate)
            const endDate = new Date(year.endDate)
            const durationMonths = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
            
            return (
              <TableRow key={year.id}>
                <TableCell className="font-medium">{year.name}</TableCell>
                <TableCell>{startDate.toLocaleDateString('id-ID')}</TableCell>
                <TableCell>{endDate.toLocaleDateString('id-ID')}</TableCell>
                <TableCell>{durationMonths} bulan</TableCell>
                <TableCell>{year.lembaga?.name || 'Semua'}</TableCell>
                <TableCell>
                  {year.isActive ? (
                    <Badge>Aktif</Badge>
                  ) : (
                    <Badge variant="outline">Tidak Aktif</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {!year.isActive ? (
                      <form action={async () => {
                        await setActiveAcademicYear(year.id, year.lembagaId)
                      }} className="inline">
                        <Button variant="ghost" size="icon" title="Aktifkan">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </Button>
                      </form>
                    ) : (
                      <form action={async () => {
                        if (confirm('Yakin ingin menonaktifkan tahun akademik ini?')) {
                          await setInactiveAcademicYear(year.id)
                        }
                      }} className="inline">
                        <Button variant="ghost" size="icon" title="Nonaktifkan">
                          <XCircle className="h-4 w-4 text-orange-500" />
                        </Button>
                      </form>
                    )}
                    <form action={async () => {
                      if (confirm('Yakin ingin menghapus tahun akademik ini?')) {
                        await deleteAcademicYear(year.id)
                      }
                    }} className="inline">
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </form>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

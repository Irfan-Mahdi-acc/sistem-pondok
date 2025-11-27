'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye } from "lucide-react"

interface SantriUjianData {
  id: string
  nama: string
  kelas?: string
  halqoh?: string
  lembaga?: string
  totalExams: number
  gradedExams: number
  ungradedExams: number
}

interface UjianHifdzSantriTableProps {
  data: SantriUjianData[]
  lembagaId?: string
}

export function UjianHifdzSantriTable({ data, lembagaId }: UjianHifdzSantriTableProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            Belum ada data ujian. Silakan tambah ujian terlebih dahulu.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Santri dengan Ujian</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Santri</TableHead>
              <TableHead>Kelas</TableHead>
              <TableHead>Halqoh</TableHead>
              <TableHead className="text-center">Total Ujian</TableHead>
              <TableHead className="text-center">Sudah Dinilai</TableHead>
              <TableHead className="text-center">Belum Dinilai</TableHead>
              <TableHead className="text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((santri) => (
              <TableRow key={santri.id}>
                <TableCell className="font-medium">{santri.nama}</TableCell>
                <TableCell>{santri.kelas || '-'}</TableCell>
                <TableCell>{santri.halqoh || '-'}</TableCell>
                <TableCell className="text-center">{santri.totalExams}</TableCell>
                <TableCell className="text-center">
                  <span className="text-green-600 font-medium">
                    {santri.gradedExams}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-amber-600 font-medium">
                    {santri.ungradedExams}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <Link href={`/dashboard/academic/ujian-hifdz/santri/${santri.id}${lembagaId ? `?lembagaId=${lembagaId}` : ''}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Detail
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

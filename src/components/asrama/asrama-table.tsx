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
import { Eye, Pencil, Trash2 } from "lucide-react"
import { deleteAsrama } from "@/actions/asrama-actions"
import { EditAsramaDialog } from "./edit-asrama-dialog"
import Link from "next/link"

export default function AsramaTable({ asramaList }: { asramaList: any[] }) {
  async function handleDelete(id: string, name: string) {
    if (confirm(`Yakin ingin menghapus asrama "${name}"?`)) {
      const res = await deleteAsrama(id)
      if (!res.success) {
        alert('Gagal menghapus asrama')
      }
    }
  }

  const getGenderLabel = (gender: string | null) => {
    if (!gender) return '-'
    switch (gender) {
      case 'L': return 'Laki-laki'
      case 'P': return 'Perempuan'
      case 'MIXED': return 'Campuran'
      default: return gender
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Asrama</TableHead>
            <TableHead>Kapasitas</TableHead>
            <TableHead>Jenis Kelamin</TableHead>
            <TableHead>Jumlah Santri</TableHead>
            <TableHead>Alamat</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {asramaList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                Belum ada data asrama
              </TableCell>
            </TableRow>
          ) : (
            asramaList.map((asrama) => (
              <TableRow key={asrama.id}>
                <TableCell className="font-medium">{asrama.name}</TableCell>
                <TableCell>{asrama.capacity}</TableCell>
                <TableCell>{getGenderLabel(asrama.gender)}</TableCell>
                <TableCell>{asrama._count.santris}</TableCell>
                <TableCell>{asrama.address || '-'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/dashboard/asrama/${asrama.id}`}>
                      <Button variant="default" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Kelola
                      </Button>
                    </Link>
                    <EditAsramaDialog asrama={asrama} />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(asrama.id, asrama.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}


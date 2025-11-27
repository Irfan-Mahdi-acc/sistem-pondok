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
import { Input } from "@/components/ui/input"
import { Trash, Edit, Search, ArrowUpDown, Eye } from "lucide-react"
import { deleteKelas } from "@/actions/kelas-actions"
import { EditKelasDialog } from "./edit-kelas-dialog"
import { useState, useMemo } from "react"
import Link from "next/link"

export default function KelasTable({ kelasList, allKelas, lembagas, lembagaId }: { kelasList: any[], allKelas?: any[], lembagas: any[], lembagaId: string }) {
  const [editingKelas, setEditingKelas] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<'name' | 'santris'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const filteredAndSortedKelas = useMemo(() => {
    let filtered = kelasList.filter(k => 
      k.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.lembaga.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    filtered.sort((a, b) => {
      let aValue, bValue
      if (sortField === 'name') {
        aValue = a.name
        bValue = b.name
      } else {
        aValue = a._count.santris
        bValue = b._count.santris
      }

      if (typeof aValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      } else {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
      }
    })

    return filtered
  }, [kelasList, searchQuery, sortField, sortOrder])

  const toggleSort = (field: 'name' | 'santris') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari kelas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" onClick={() => toggleSort('name')} className="h-8 px-2">
                  Nama Kelas
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Lembaga</TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => toggleSort('santris')} className="h-8 px-2">
                  Jumlah Santri
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Kelas Selanjutnya</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedKelas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Tidak ada data
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedKelas.map((kelas) => (
                <TableRow key={kelas.id}>
                  <TableCell className="font-medium">{kelas.name}</TableCell>
                  <TableCell>{kelas.lembaga.name}</TableCell>
                  <TableCell>{kelas._count.santris}</TableCell>
                  <TableCell>
                    {kelas.nextKelas ? (
                      <span>{kelas.nextKelas.name} ({kelas.nextKelas.lembaga.name})</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/dashboard/kelas-detail/${lembagaId}/${kelas.id}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4 text-green-500" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setEditingKelas(kelas)}
                      >
                        <Edit className="h-4 w-4 text-blue-500" />
                      </Button>
                      <form action={async () => {
                        if (confirm('Yakin ingin menghapus kelas ini?')) {
                          await deleteKelas(kelas.id)
                        }
                      }}>
                        <Button variant="ghost" size="icon" type="submit">
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editingKelas && (
        <EditKelasDialog 
          kelas={editingKelas} 
          lembagas={lembagas}
          kelasList={allKelas || kelasList}
          open={!!editingKelas} 
          onOpenChange={(open: boolean) => !open && setEditingKelas(null)} 
        />
      )}
    </div>
  )
}

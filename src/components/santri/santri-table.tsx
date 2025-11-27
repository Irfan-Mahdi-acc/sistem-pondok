'use client'

import { useState, useMemo } from 'react'
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
import { Trash2, Eye, Search, ArrowUpDown } from "lucide-react"
import { deleteSantri } from "@/actions/santri-actions"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default function SantriTable({ santriList }: { santriList: any[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<'nama' | 'nis' | 'lembaga'>('nama')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Sorting logic
  const sortedSantri = useMemo(() => {
    const sorted = [...santriList].sort((a, b) => {
      let aValue, bValue

      switch(sortField) {
        case 'nama':
          aValue = a.nama.toLowerCase()
          bValue = b.nama.toLowerCase()
          break
        case 'nis':
          aValue = a.nis
          bValue = b.nis
          break
        case 'lembaga':
          aValue = a.lembaga?.name.toLowerCase() || ''
          bValue = b.lembaga?.name.toLowerCase() || ''
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return sorted
  }, [santriList, sortField, sortDirection])

  // Search filter
  const filteredSantri = useMemo(() => {
    if (!searchQuery) return sortedSantri
    
    return sortedSantri.filter(santri =>
      santri.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      santri.nis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (santri.nisn && santri.nisn.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [sortedSantri, searchQuery])

  const handleSort = (field: 'nama' | 'nis' | 'lembaga') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const SortIcon = ({ field }: { field: 'nama' | 'nis' | 'lembaga' }) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 ml-2 opacity-30" />
    return sortDirection === 'asc' ? ' ↑' : ' ↓'
  }

  return (
    <div className="space-y-4">
      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Menampilkan {filteredSantri.length} dari {santriList.length} santri
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('nis')} className="hover:bg-transparent">
                  NIS <SortIcon field="nis" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('nama')} className="hover:bg-transparent">
                  Nama <SortIcon field="nama" />
                </Button>
              </TableHead>
              <TableHead>Jenis Kelamin</TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('lembaga')} className="hover:bg-transparent">
                  Lembaga <SortIcon field="lembaga" />
                </Button>
              </TableHead>
              <TableHead>Kelas</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSantri.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Tidak ada data santri
                </TableCell>
              </TableRow>
            ) : (
              filteredSantri.map((santri) => (
                <TableRow key={santri.id}>
                  <TableCell className="font-medium">{santri.nis}</TableCell>
                  <TableCell>{santri.nama}</TableCell>
                  <TableCell>{santri.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{santri.lembaga?.name || '-'}</Badge>
                  </TableCell>
                  <TableCell>{santri.kelas?.name || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={santri.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {santri.status === 'ACTIVE' ? 'Aktif' : 
                       santri.status === 'GRADUATED' ? 'Lulus' : 
                       santri.status === 'DROPPED' ? 'Keluar' : 
                       santri.status === 'TRANSFERRED' ? 'Pindah' : santri.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/dashboard/santri/${santri.id}`}>
                        <Button variant="default" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Lihat
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={async () => {
                          if (confirm('Yakin ingin menghapus santri ini? Semua data terkait akan dihapus.')) {
                            const result = await deleteSantri(santri.id)
                            if (result.success) {
                              window.location.reload() // Auto-reload after delete
                            } else {
                              alert('Gagal menghapus santri: ' + (result.error || 'Unknown error'))
                            }
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

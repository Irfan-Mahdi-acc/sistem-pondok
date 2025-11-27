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
import { Pencil, Trash2, Eye, Search, ArrowUpDown } from "lucide-react"
import { deleteLembaga } from "@/actions/lembaga-actions"
import Link from "next/link"
import { EditLembagaDialog } from "./edit-lembaga-dialog"
import { LembagaTags } from "./lembaga-tags"
import { TruncatedText } from "@/components/ui/truncated-text"

export default function LembagaTable({ lembagas }: { lembagas: any[] }) {
  const [editingLembaga, setEditingLembaga] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<'name' | 'santris' | 'kelas'>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Sorting logic
  const sortedLembagas = useMemo(() => {
    const sorted = [...lembagas].sort((a, b) => {
      let aValue, bValue

      switch(sortField) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'santris':
          aValue = a._count.santris
          bValue = b._count.santris
          break
        case 'kelas':
          aValue = a._count.kelas
          bValue = b._count.kelas
          break
        default:
          return 0
      }

      if (typeof aValue === 'string') {
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
        return 0
      } else {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }
    })

    return sorted
  }, [lembagas, sortField, sortDirection])

  // Search filter
  const filteredLembagas = useMemo(() => {
    if (!searchQuery) return sortedLembagas
    
    return sortedLembagas.filter(lembaga =>
      lembaga.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lembaga.address && lembaga.address.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [sortedLembagas, searchQuery])

  const handleSort = (field: 'name' | 'santris' | 'kelas') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const SortIcon = ({ field }: { field: 'name' | 'santris' | 'kelas' }) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 ml-2 opacity-30" />
    return sortDirection === 'asc' ? ' ↑' : ' ↓'
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari lembaga..."
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
                  <Button variant="ghost" onClick={() => handleSort('name')} className="h-8 px-2">
                    Nama
                    <SortIcon field="name" />
                  </Button>
                </TableHead>
                <TableHead>Alamat</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('santris')} className="h-8 px-2">
                    Santri
                    <SortIcon field="santris" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('kelas')} className="h-8 px-2">
                    Kelas
                    <SortIcon field="kelas" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLembagas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Tidak ada data
                  </TableCell>
                </TableRow>
              ) : (
                filteredLembagas.map((lembaga) => (
                  <TableRow key={lembaga.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {lembaga.logoUrl && <img src={lembaga.logoUrl} alt="logo" className="h-6 w-6 rounded-full object-cover" />}
                        <TruncatedText text={lembaga.name} maxLength={40} className="font-medium" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <TruncatedText text={lembaga.address || '-'} maxLength={50} />
                    </TableCell>
                    <TableCell>
                      <LembagaTags tags={lembaga.tags} />
                    </TableCell>
                    <TableCell>{lembaga._count.santris}</TableCell>
                    <TableCell>{lembaga._count.kelas}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/dashboard/lembaga/${lembaga.id}`}>
                          <Button variant="default" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Lihat
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setEditingLembaga(lembaga)}
                        >
                          <Pencil className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={async () => {
                            if (confirm(`Yakin ingin menghapus lembaga "${lembaga.name}"? Semua data terkait (santri, kelas, dll) akan dihapus.`)) {
                              const result = await deleteLembaga(lembaga.id, 'Ketanggung05')
                              if (result.success) {
                                window.location.reload()
                              } else {
                                alert('Gagal menghapus lembaga: ' + (result.error || 'Unknown error'))
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

      {editingLembaga && (
        <EditLembagaDialog 
          lembaga={editingLembaga} 
          open={!!editingLembaga} 
          onOpenChange={(open: boolean) => !open && setEditingLembaga(null)} 
        />
      )}
    </>
  )
}

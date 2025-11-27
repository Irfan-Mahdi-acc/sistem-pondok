'use client'

import { useState } from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Trash2, AlertTriangle, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { deleteViolationRecord } from "@/actions/violation-actions"
import { useToast } from "@/components/ui/toast"

type ViolationListProps = {
  initialRecords: any[]
  categories: any[]
}

export function ViolationList({ initialRecords, categories }: ViolationListProps) {
  const [records, setRecords] = useState(initialRecords)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const toast = useToast()

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.santri.nama.toLowerCase().includes(search.toLowerCase()) ||
                          record.description?.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === "all" || record.categoryId === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data pelanggaran ini?")) return

    const result = await deleteViolationRecord(id)
    if (result.success) {
      setRecords(records.filter(r => r.id !== id))
      toast.showToast("Data pelanggaran berhasil dihapus", "success")
    } else {
      toast.showToast(result.error || "Gagal menghapus data", "error")
    }
  }

  const getSeverityColor = (type: string) => {
    switch (type) {
      case 'RINGAN': return 'bg-yellow-100 text-yellow-800'
      case 'SEDANG': return 'bg-orange-100 text-orange-800'
      case 'BERAT': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari santri atau keterangan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Santri</TableHead>
              <TableHead>Pelanggaran</TableHead>
              <TableHead>Poin</TableHead>
              <TableHead>Sanksi</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Tidak ada data pelanggaran
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    {format(new Date(record.date), 'dd MMM yyyy', { locale: id })}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{record.santri.nama}</div>
                    <div className="text-xs text-muted-foreground">{record.santri.nis}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{record.category.name}</div>
                    <Badge variant="outline" className={`mt-1 ${getSeverityColor(record.category.type)}`}>
                      {record.category.type}
                    </Badge>
                    {record.description && (
                      <div className="text-xs text-muted-foreground mt-1">{record.description}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-red-600">+{record.category.points}</span>
                  </TableCell>
                  <TableCell>
                    {record.sanction || "-"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(record.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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

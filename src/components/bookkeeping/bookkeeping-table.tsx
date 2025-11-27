'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, Edit, Trash2, Users } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { EditBookkeepingDialog } from './edit-bookkeeping-dialog'
import { AssignUserDialog } from './assign-user-dialog'
import { deleteBookkeeping } from '@/actions/bookkeeping-management-actions'
import { useRouter } from 'next/navigation'

type Bookkeeping = {
  id: string
  name: string
  type: string
  status: string
  description: string | null
  lembaga: { id: string; name: string } | null
  _count: {
    transactions: number
    assignments: number
  }
}

export function BookkeepingTable({ bookkeepings }: { bookkeepings: Bookkeeping[] }) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [assigningId, setAssigningId] = useState<string | null>(null)
  const [assigningBookkeeping, setAssigningBookkeeping] = useState<{ id: string; name: string } | null>(null)

  const getTypeBadge = (type: string) => {
    const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
      UMUM: { label: 'Umum', variant: 'default' },
      LEMBAGA: { label: 'Lembaga', variant: 'secondary' },
      CUSTOM: { label: 'Custom', variant: 'outline' },
    }
    const config = variants[type] || { label: type, variant: 'default' }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getStatusBadge = (status: string) => {
    return status === 'ACTIVE' 
      ? <Badge variant="default" className="bg-green-600">Aktif</Badge>
      : <Badge variant="secondary">Archived</Badge>
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Hapus pembukuan "${name}"? Semua transaksi akan terhapus!`)) return
    
    const result = await deleteBookkeeping(id)
    if (result.success) {
      router.refresh()
    } else {
      alert(result.error)
    }
  }

  const editingBookkeeping = bookkeepings.find(b => b.id === editingId)

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Lembaga</TableHead>
              <TableHead className="text-center">Transaksi</TableHead>
              <TableHead className="text-center">Pengurus</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookkeepings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Belum ada pembukuan
                </TableCell>
              </TableRow>
            ) : (
              bookkeepings.map((bookkeeping) => (
                <TableRow key={bookkeeping.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{bookkeeping.name}</div>
                      {bookkeeping.description && (
                        <div className="text-xs text-muted-foreground">{bookkeeping.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(bookkeeping.type)}</TableCell>
                  <TableCell>
                    {bookkeeping.lembaga ? (
                      <span className="text-sm">{bookkeeping.lembaga.name}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{bookkeeping._count.transactions}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setAssigningId(bookkeeping.id)
                        setAssigningBookkeeping({ id: bookkeeping.id, name: bookkeeping.name })
                      }}
                      className="h-7 gap-1"
                    >
                      <Users className="h-3 w-3" />
                      <span>{bookkeeping._count.assignments}</span>
                    </Button>
                  </TableCell>
                  <TableCell>{getStatusBadge(bookkeeping.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/finance/bookkeeping/${bookkeeping.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Lihat Detail
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditingId(bookkeeping.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setAssigningId(bookkeeping.id)
                          setAssigningBookkeeping({ id: bookkeeping.id, name: bookkeeping.name })
                        }}>
                          <Users className="mr-2 h-4 w-4" />
                          Kelola Pengurus
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(bookkeeping.id, bookkeeping.name)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editingBookkeeping && (
        <EditBookkeepingDialog
          bookkeeping={editingBookkeeping}
          open={!!editingId}
          onOpenChange={(open) => !open && setEditingId(null)}
        />
      )}

      {assigningBookkeeping && (
        <AssignUserDialog
          bookkeeping={assigningBookkeeping}
          open={!!assigningId}
          onOpenChange={(open) => {
            if (!open) {
              setAssigningId(null)
              setAssigningBookkeeping(null)
            }
          }}
        />
      )}
    </>
  )
}


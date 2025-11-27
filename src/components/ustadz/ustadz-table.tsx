'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2, Eye, Settings, Pencil } from "lucide-react"
import { deleteUstadz } from "@/actions/ustadz-actions"
import { ManageUstadzUserDialog } from "./manage-ustadz-user-dialog"
import { EditUstadzDialog } from "./edit-ustadz-dialog"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default function UstadzTable({ ustadzList }: { ustadzList: any[] }) {
  const [managingUstadz, setManagingUstadz] = useState<any>(null)
  const [editingUstadz, setEditingUstadz] = useState<any>(null)

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>NIK</TableHead>
              <TableHead>Spesialisasi</TableHead>
              <TableHead>Mata Pelajaran</TableHead>
              <TableHead>Halqoh</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ustadzList.map((ustadz) => (
              <TableRow key={ustadz.id}>
                <TableCell className="font-medium">
                  {ustadz.user?.name || '(Belum terhubung)'}
                </TableCell>
                <TableCell>{ustadz.nik || '-'}</TableCell>
                <TableCell>{ustadz.specialization || '-'}</TableCell>
                <TableCell>{ustadz._count.mapels}</TableCell>
                <TableCell>{ustadz._count.halqohs}</TableCell>
                <TableCell>
                  <Badge variant={ustadz.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {ustadz.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/dashboard/ustadz/${ustadz.id}`}>
                      <Button variant="default" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setManagingUstadz(ustadz)}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Kelola
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditingUstadz(ustadz)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={async () => {
                        if (confirm('Yakin ingin menghapus? Semua data terkait akan dihapus.')) {
                          const result = await deleteUstadz(ustadz.id)
                          if (!result.success) {
                            alert('Gagal menghapus: ' + (result.error || 'Unknown error'))
                          }
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {managingUstadz && (
        <ManageUstadzUserDialog
          open={!!managingUstadz}
          onOpenChange={(open) => !open && setManagingUstadz(null)}
          ustadz={managingUstadz}
        />
      )}

      {editingUstadz && (
        <EditUstadzDialog
          open={!!editingUstadz}
          onOpenChange={(open) => !open && setEditingUstadz(null)}
          ustadz={editingUstadz}
        />
      )}
    </>
  )
}

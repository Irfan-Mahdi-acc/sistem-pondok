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
import { Trash2, Edit, Settings, Eye } from "lucide-react"
import { deleteMusyrif } from "@/actions/musyrif-actions"
import { EditMusyrifDialog } from "./edit-musyrif-dialog"
import { ManageMusyrifUserDialog } from "./manage-musyrif-user-dialog"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export function MusyrifTable({ musyrifList }: { musyrifList: any[] }) {
  const [editingMusyrif, setEditingMusyrif] = useState<any>(null)
  const [managingMusyrif, setManagingMusyrif] = useState<any>(null)

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>NIK</TableHead>
              <TableHead>Asrama</TableHead>
              <TableHead>Telepon</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {musyrifList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Belum ada data musyrif
                </TableCell>
              </TableRow>
            ) : (
              musyrifList.map((musyrif) => (
                <TableRow key={musyrif.id}>
                  <TableCell className="font-medium">{musyrif.user.name}</TableCell>
                  <TableCell>{musyrif.nik || '-'}</TableCell>
                  <TableCell>{musyrif.specialization || '-'}</TableCell>
                  <TableCell>{musyrif.phone || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={musyrif.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {musyrif.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/dashboard/musyrif/${musyrif.id}`}>
                        <Button variant="default" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setManagingMusyrif(musyrif)}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Kelola
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEditingMusyrif(musyrif)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={async () => {
                          if (confirm('Yakin ingin menghapus musyrif ini?')) {
                            const result = await deleteMusyrif(musyrif.id)
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
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editingMusyrif && (
        <EditMusyrifDialog
          open={!!editingMusyrif}
          onOpenChange={(open: boolean) => !open && setEditingMusyrif(null)}
          musyrif={editingMusyrif}
        />
      )}

      {managingMusyrif && (
        <ManageMusyrifUserDialog
          open={!!managingMusyrif}
          onOpenChange={(open: boolean) => !open && setManagingMusyrif(null)}
          musyrif={managingMusyrif}
        />
      )}
    </>
  )
}

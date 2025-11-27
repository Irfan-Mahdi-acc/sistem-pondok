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
import { deletePengurus } from "@/actions/pengurus-actions"
import { EditPengurusDialog } from "./edit-pengurus-dialog"
import { ManagePengurusUserDialog } from "./manage-pengurus-user-dialog"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export function PengurusTable({ pengurusList }: { pengurusList: any[] }) {
  const [editingPengurus, setEditingPengurus] = useState<any>(null)
  const [managingPengurus, setManagingPengurus] = useState<any>(null)

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>NIK</TableHead>
              <TableHead>Jabatan</TableHead>
              <TableHead>Telepon</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pengurusList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Belum ada data pengurus
                </TableCell>
              </TableRow>
            ) : (
              pengurusList.map((pengurus) => (
                <TableRow key={pengurus.id}>
                  <TableCell className="font-medium">{pengurus.user.name}</TableCell>
                  <TableCell>{pengurus.nik || '-'}</TableCell>
                  <TableCell>{pengurus.specialization || '-'}</TableCell>
                  <TableCell>{pengurus.phone || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={pengurus.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {pengurus.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/dashboard/pengurus/${pengurus.id}`}>
                        <Button variant="default" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setManagingPengurus(pengurus)}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Kelola
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEditingPengurus(pengurus)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={async () => {
                          if (confirm('Yakin ingin menghapus pengurus ini?')) {
                            const result = await deletePengurus(pengurus.id)
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

      {editingPengurus && (
        <EditPengurusDialog
          open={!!editingPengurus}
          onOpenChange={(open: boolean) => !open && setEditingPengurus(null)}
          pengurus={editingPengurus}
        />
      )}

      {managingPengurus && (
        <ManagePengurusUserDialog
          open={!!managingPengurus}
          onOpenChange={(open: boolean) => !open && setManagingPengurus(null)}
          pengurus={managingPengurus}
        />
      )}
    </>
  )
}

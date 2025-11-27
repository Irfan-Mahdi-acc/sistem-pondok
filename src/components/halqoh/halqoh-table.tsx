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
import { Trash2, Eye } from "lucide-react"
import { deleteHalqoh } from "@/actions/halqoh-actions"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { EditHalqohDialog } from "./edit-halqoh-dialog"
import { useState } from "react"

export default function HalqohTable({ halqohList, instructorList }: { halqohList: any[], instructorList: any[] }) {
  const [editingHalqoh, setEditingHalqoh] = useState<any>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this halqoh?')) return
    
    setDeletingId(id)
    await deleteHalqoh(id)
    setDeletingId(null)
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Pembimbing</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Students</TableHead>
            <TableHead>Capacity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {halqohList.map((halqoh) => (
            <TableRow key={halqoh.id}>
              <TableCell className="font-medium">{halqoh.name}</TableCell>
              <TableCell>{halqoh.ustadz?.user.name || 'Not Assigned'}</TableCell>
              <TableCell>{halqoh.level || '-'}</TableCell>
              <TableCell>{halqoh._count.santris}</TableCell>
              <TableCell>{halqoh.maxCapacity || 'Unlimited'}</TableCell>
              <TableCell>
                <Badge variant={halqoh.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {halqoh.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Link href={`/dashboard/academic/halqoh/${halqoh.id}`}>
                    <Button variant="default" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </Link>
                  <EditHalqohDialog halqoh={halqoh} instructorList={instructorList} />
                  <form action={async () => {
                    await handleDelete(halqoh.id)
                  }}>
                    <Button variant="ghost" size="icon" disabled={deletingId === halqoh.id}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </form>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

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
import { Trash2, Edit } from "lucide-react"
import { deleteMapel } from "@/actions/mapel-actions"
import { EditMapelDialog } from "./edit-mapel-dialog"
import { useState } from "react"

export default function MapelTable({ mapels, kelasList, instructorList }: { mapels: any[], kelasList: any[], instructorList: any[] }) {
  const [editingMapel, setEditingMapel] = useState<any>(null)

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subject Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Pengampu</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mapels.map((mapel) => (
            <TableRow key={mapel.id}>
              <TableCell className="font-medium">{mapel.name}</TableCell>
              <TableCell>{mapel.code || '-'}</TableCell>
              <TableCell>{mapel.kelas.name}</TableCell>
              <TableCell>{mapel.ustadz?.user.name || '-'}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setEditingMapel(mapel)}
                  >
                    <Edit className="h-4 w-4 text-blue-500" />
                  </Button>
                  <form action={async () => {
                    if (confirm('Are you sure?')) {
                      await deleteMapel(mapel.id)
                    }
                  }}>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </form>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingMapel && (
        <EditMapelDialog 
          mapel={editingMapel} 
          kelasList={kelasList}
          instructorList={instructorList}
          open={!!editingMapel} 
          onOpenChange={(open) => !open && setEditingMapel(null)} 
        />
      )}
    </div>
  )
}

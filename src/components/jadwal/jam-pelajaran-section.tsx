'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Edit } from "lucide-react"
import { AddJamPelajaranDialog } from "./add-jam-pelajaran-dialog"
import { EditJamPelajaranDialog } from "./edit-jam-pelajaran-dialog"
import { useState } from "react"
import { deleteJamPelajaran } from "@/actions/jadwal-actions"

export default function JamPelajaranSection({ jamPelajaran, lembagaId }: { jamPelajaran: any[], lembagaId: string }) {
  const [openAdd, setOpenAdd] = useState(false)
  const [editingJam, setEditingJam] = useState<any>(null)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Jam Pelajaran</CardTitle>
        <Button onClick={() => setOpenAdd(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Tambah Jam
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          {jamPelajaran.map((jam) => (
            <div key={jam.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <span className="font-medium">{jam.name}</span>
                <span className="text-sm text-muted-foreground ml-3">
                  {jam.startTime} - {jam.endTime}
                </span>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setEditingJam(jam)}
                >
                  <Edit className="h-4 w-4 text-blue-500" />
                </Button>
                <form action={async () => {
                  if (confirm('Yakin ingin menghapus jam pelajaran ini?')) {
                    await deleteJamPelajaran(jam.id)
                  }
                }}>
                  <Button variant="ghost" size="icon" type="submit">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </form>
              </div>
            </div>
          ))}
          {jamPelajaran.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Belum ada jam pelajaran. Klik "Tambah Jam" untuk memulai.
            </p>
          )}
        </div>
      </CardContent>

      <AddJamPelajaranDialog 
        open={openAdd} 
        onOpenChange={setOpenAdd} 
        lembagaId={lembagaId}
        nextOrder={jamPelajaran.length + 1}
      />

      {editingJam && (
        <EditJamPelajaranDialog 
          jamPelajaran={editingJam}
          open={!!editingJam} 
          onOpenChange={(open) => !open && setEditingJam(null)} 
        />
      )}
    </Card>
  )
}

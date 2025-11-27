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
import { Trash2 } from "lucide-react"
import { deleteTahfidzRecord } from "@/actions/tahfidz-actions"
import { Badge } from "@/components/ui/badge"

export default function TahfidzTable({ records }: { records: any[] }) {
  const getGradeBadge = (grade: string | null) => {
    if (!grade) return <span className="text-muted-foreground">-</span>
    const variants: { [key: string]: "default" | "secondary" | "destructive" } = {
      'A': 'default',
      'B': 'secondary',
      'C': 'secondary',
      'D': 'destructive'
    }
    return <Badge variant={variants[grade] || 'secondary'}>{grade}</Badge>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Student</TableHead>
            <TableHead>Halqoh</TableHead>
            <TableHead>Surah</TableHead>
            <TableHead>Ayat</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Grade</TableHead>
            <TableHead>Ustadz</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell>{new Date(record.date).toLocaleDateString('id-ID')}</TableCell>
              <TableCell className="font-medium">{record.santri.nama}</TableCell>
              <TableCell>{record.santri.halqoh?.name || '-'}</TableCell>
              <TableCell>{record.surah}</TableCell>
              <TableCell>{record.ayatStart} - {record.ayatEnd}</TableCell>
              <TableCell>
                <Badge variant="outline">{record.type}</Badge>
              </TableCell>
              <TableCell>{getGradeBadge(record.grade)}</TableCell>
              <TableCell>{record.ustadz?.user.name || '-'}</TableCell>
              <TableCell className="text-right">
                <form action={async () => {
                  if (confirm('Are you sure?')) {
                    await deleteTahfidzRecord(record.id)
                  }
                }}>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </form>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

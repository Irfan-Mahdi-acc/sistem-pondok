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
import { MoreHorizontal, Eye, Trash2, Download } from 'lucide-react'
import { deleteDocument } from '@/actions/surat-actions'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { getDocumentTypeInfo } from '@/lib/document-types'

type Document = {
  id: string
  title: string
  type: string
  number: string | null
  date: Date
  sender: string | null
  recipient: string | null
  fileUrl: string
  description: string | null
  lembaga: {
    id: string
    name: string
  } | null
}

export function DocumentTable({ documents }: { documents: Document[] }) {
  async function handleDelete(id: string, title: string) {
    if (confirm(`Hapus dokumen "${title}"?`)) {
      const result = await deleteDocument(id)
      if (!result.success) {
        alert(result.error)
      }
    }
  }

  function getTypeBadge(type: string) {
    const typeInfo = getDocumentTypeInfo(type)
    return (
      <Badge variant="outline" className="text-xs">
        {typeInfo.label}
      </Badge>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nomor</TableHead>
              <TableHead>Jenis</TableHead>
              <TableHead>Perihal</TableHead>
              <TableHead>Lingkup</TableHead>
              <TableHead>Bulan/Tahun</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
        <TableBody>
          {documents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                <div className="flex flex-col items-center gap-2">
                  <p className="text-lg">📄</p>
                  <p>Belum ada dokumen</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-mono text-sm font-medium">
                  {doc.number || '-'}
                </TableCell>
                <TableCell>{getTypeBadge(doc.type)}</TableCell>
                <TableCell className="font-medium max-w-md">
                  <div className="truncate" title={doc.title}>
                    {doc.title}
                  </div>
                  {doc.description && (
                    <p className="text-xs text-muted-foreground truncate" title={doc.description}>
                      {doc.description}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  {doc.lembaga ? (
                    <Badge variant="secondary" className="text-xs">
                      {doc.lembaga.name}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      🏛️ Pondok
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {format(new Date(doc.date), 'MMM yyyy', { locale: localeId })}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {doc.fileUrl && doc.fileUrl !== '-' && (
                        <>
                          <DropdownMenuItem asChild>
                            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                              <Eye className="mr-2 h-4 w-4" />
                              Lihat File
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a href={doc.fileUrl} download>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </a>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDelete(doc.id, doc.title)}
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
  )
}


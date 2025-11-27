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
import { MoreHorizontal, Pencil, Trash2, Wrench } from 'lucide-react'
import { deleteAsset } from '@/actions/inventaris-actions'
import { useState } from 'react'
import { EditAssetDialog } from './edit-asset-dialog'
import { AddMaintenanceLogDialog } from './add-maintenance-log-dialog'

type Asset = {
  id: string
  name: string
  code: string | null
  category: string
  condition: string
  location: string | null
  purchaseDate: Date | null
  price: number | null
  _count: {
    maintenanceLogs: number
  }
}

export function AssetTable({ assets }: { assets: Asset[] }) {
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [maintenanceAsset, setMaintenanceAsset] = useState<Asset | null>(null)

  async function handleDelete(id: string, name: string) {
    if (confirm(`Hapus aset "${name}"?`)) {
      const result = await deleteAsset(id)
      if (!result.success) {
        alert(result.error)
      }
    }
  }

  function getConditionBadge(condition: string) {
    const variants: Record<string, { label: string; variant: 'default' | 'destructive' | 'secondary' }> = {
      GOOD: { label: 'Baik', variant: 'default' },
      DAMAGED: { label: 'Rusak', variant: 'destructive' },
      LOST: { label: 'Hilang', variant: 'secondary' },
    }
    const config = variants[condition] || { label: condition, variant: 'secondary' }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode</TableHead>
              <TableHead>Nama Aset</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Kondisi</TableHead>
              <TableHead>Lokasi</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Pemeliharaan</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  Belum ada data aset
                </TableCell>
              </TableRow>
            ) : (
              assets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell className="font-mono text-sm">
                    {asset.code || '-'}
                  </TableCell>
                  <TableCell className="font-medium">{asset.name}</TableCell>
                  <TableCell>{asset.category}</TableCell>
                  <TableCell>{getConditionBadge(asset.condition)}</TableCell>
                  <TableCell>{asset.location || '-'}</TableCell>
                  <TableCell>
                    {asset.price ? `Rp ${asset.price.toLocaleString('id-ID')}` : '-'}
                  </TableCell>
                  <TableCell>
                    {asset._count.maintenanceLogs} log
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setMaintenanceAsset(asset)}>
                          <Wrench className="mr-2 h-4 w-4" />
                          Log Pemeliharaan
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditingAsset(asset)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(asset.id, asset.name)}
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

      {editingAsset && (
        <EditAssetDialog
          asset={editingAsset}
          open={!!editingAsset}
          onOpenChange={(open) => !open && setEditingAsset(null)}
        />
      )}

      {maintenanceAsset && (
        <AddMaintenanceLogDialog
          asset={maintenanceAsset}
          open={!!maintenanceAsset}
          onOpenChange={(open) => !open && setMaintenanceAsset(null)}
        />
      )}
    </>
  )
}



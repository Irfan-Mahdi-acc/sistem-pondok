'use client'

import { useState } from 'react'
import { createBookkeepingTransaction } from '@/actions/bookkeeping-transaction-actions'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

type Category = {
  id: string
  name: string
  type: string
}

export function AddTransactionDialog({
  bookkeepingId,
  categories,
}: {
  bookkeepingId: string
  categories: Category[]
}) {
  const router = useRouter()
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState('INCOME')

  const filteredCategories = categories.filter(c => c.type === type)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    
    // Add recordedBy
    formData.set('recordedBy', session?.user?.name || '')
    
    const result = await createBookkeepingTransaction(bookkeepingId, formData)
    
    if (result.success) {
      setOpen(false)
      router.refresh()
    } else {
      alert(result.error)
    }
    
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Transaksi
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Transaksi</DialogTitle>
          <DialogDescription>
            Catat transaksi pemasukan atau pengeluaran
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipe Transaksi *</Label>
            <Select name="type" value={type} onValueChange={setType} required disabled={loading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INCOME">Pemasukan</SelectItem>
                <SelectItem value="EXPENSE">Pengeluaran</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">Kategori *</Label>
            <Select name="categoryId" required disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Jumlah *</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                placeholder="0"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Tanggal *</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi *</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Keterangan transaksi..."
              rows={3}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Referensi/No. Bukti</Label>
            <Input
              id="reference"
              name="reference"
              placeholder="e.g., INV-001, NOTA-123"
              disabled={loading}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}


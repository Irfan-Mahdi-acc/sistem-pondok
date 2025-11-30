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
import { MoreHorizontal, Edit, Trash2, Lock } from 'lucide-react'
import { format, isWithinInterval } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { deleteBookkeepingTransaction } from '@/actions/bookkeeping-transaction-actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

type Transaction = {
  id: string
  amount: number
  type: string
  date: Date
  description: string
  reference: string | null
  recordedBy: string | null
  category: {
    id: string
    name: string
    type: string
  }
}

type Category = {
  id: string
  name: string
  type: string
}

type ClosedPeriod = {
  periodStart: Date
  periodEnd: Date
}

export function BookkeepingTransactionTable({
  transactions,
  bookkeepingId,
  canEdit,
  categories,
  closedPeriods = [],
}: {
  transactions: Transaction[]
  bookkeepingId: string
  canEdit: boolean
  categories: Category[]
  closedPeriods?: ClosedPeriod[]
}) {
  const router = useRouter()

  async function handleDelete(id: string) {
    if (!confirm('Hapus transaksi ini?')) return

    const result = await deleteBookkeepingTransaction(id, bookkeepingId)
    if (result.success) {
      toast.success('Transaksi berhasil dihapus')
      router.refresh()
    } else {
      toast.error(result.error || 'Gagal menghapus transaksi')
    }
  }

  const isTransactionClosed = (date: Date) => {
    return closedPeriods.some(period => 
      isWithinInterval(new Date(date), {
        start: new Date(period.periodStart),
        end: new Date(period.periodEnd)
      })
    )
  }

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="space-y-4">
      {/* Summary Row */}
      {transactions.length > 0 && (
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
          <div>
            <p className="text-xs text-muted-foreground">Total Pemasukan</p>
            <p className="text-lg font-bold text-green-600">
              Rp {totalIncome.toLocaleString('id-ID')}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Pengeluaran</p>
            <p className="text-lg font-bold text-red-600">
              Rp {totalExpense.toLocaleString('id-ID')}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Saldo Periode Ini</p>
            <p className={`text-lg font-bold ${
              (totalIncome - totalExpense) >= 0 ? 'text-blue-600' : 'text-red-600'
            }`}>
              Rp {(totalIncome - totalExpense).toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead>Referensi</TableHead>
              <TableHead className="text-right">Pemasukan</TableHead>
              <TableHead className="text-right">Pengeluaran</TableHead>
              <TableHead>Dicatat Oleh</TableHead>
              {canEdit && <TableHead className="text-right">Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canEdit ? 8 : 7} className="text-center text-muted-foreground py-8">
                  Belum ada transaksi
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => {
                const isClosed = isTransactionClosed(transaction.date)
                
                return (
                  <TableRow key={transaction.id} className={isClosed ? "bg-muted/30" : ""}>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {format(new Date(transaction.date), 'dd MMM yyyy', { locale: localeId })}
                        {isClosed && <Lock className="h-3 w-3 text-muted-foreground" />}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {transaction.category.name}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {transaction.description}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {transaction.reference || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {transaction.type === 'INCOME' ? (
                        <span className="font-medium text-green-600">
                          Rp {transaction.amount.toLocaleString('id-ID')}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {transaction.type === 'EXPENSE' ? (
                        <span className="font-medium text-red-600">
                          Rp {transaction.amount.toLocaleString('id-ID')}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {transaction.recordedBy || '-'}
                    </TableCell>
                    {canEdit && (
                      <TableCell className="text-right">
                        {!isClosed ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleDelete(transaction.id)}>
                                <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                                Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <Button variant="ghost" size="icon" disabled>
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}


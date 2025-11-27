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
import { deleteTransaction } from "@/actions/transaction-actions"
import { Badge } from "@/components/ui/badge"

export default function TransactionTable({ transactions }: { transactions: any[] }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{new Date(transaction.date).toLocaleDateString('id-ID')}</TableCell>
              <TableCell>
                <Badge variant={transaction.type === 'INCOME' ? 'default' : 'destructive'}>
                  {transaction.type}
                </Badge>
              </TableCell>
              <TableCell>{transaction.category.name}</TableCell>
              <TableCell className="font-medium">{transaction.description}</TableCell>
              <TableCell className={transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}>
                Rp {transaction.amount.toLocaleString('id-ID')}
              </TableCell>
              <TableCell>{transaction.reference || '-'}</TableCell>
              <TableCell className="text-right">
                <form action={async () => {
                  if (confirm('Are you sure?')) {
                    await deleteTransaction(transaction.id)
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

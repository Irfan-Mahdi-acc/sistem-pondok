'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function PaymentTable({ payments }: { payments: any[] }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Receipt No</TableHead>
            <TableHead>Student</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Note</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>{new Date(payment.paymentDate).toLocaleDateString('id-ID')}</TableCell>
              <TableCell className="font-medium">{payment.receiptNumber}</TableCell>
              <TableCell>{payment.billing.santri.nama}</TableCell>
              <TableCell>{payment.billing.category.name}</TableCell>
              <TableCell>Rp {payment.amount.toLocaleString('id-ID')}</TableCell>
              <TableCell>
                <Badge variant="outline">{payment.paymentMethod}</Badge>
              </TableCell>
              <TableCell>{payment.note || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

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
import { Trash2, DollarSign } from "lucide-react"
import { deleteBilling, recordPayment } from "@/actions/billing-actions"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function BillingTable({ billings }: { billings: any[] }) {
  const [paymentDialog, setPaymentDialog] = useState<any>(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [receiptNumber, setReceiptNumber] = useState('')

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" } = {
      'PAID': 'default',
      'UNPAID': 'secondary',
      'OVERDUE': 'destructive',
      'PARTIAL': 'secondary'
    }
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>
  }

  async function handlePayment() {
    if (!paymentDialog || !paymentAmount || !receiptNumber) {
      alert('Please fill all fields')
      return
    }

    const res = await recordPayment(
      paymentDialog.id,
      parseFloat(paymentAmount),
      paymentMethod,
      receiptNumber
    )

    if (res.success) {
      setPaymentDialog(null)
      setPaymentAmount('')
      setReceiptNumber('')
    } else {
      alert('Failed to record payment')
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Month</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {billings.map((billing) => (
              <TableRow key={billing.id}>
                <TableCell className="font-medium">{billing.santri.nama}</TableCell>
                <TableCell>{billing.santri.kelas?.name || '-'}</TableCell>
                <TableCell>{billing.category.name}</TableCell>
                <TableCell>Rp {billing.amount.toLocaleString('id-ID')}</TableCell>
                <TableCell>{new Date(billing.dueDate).toLocaleDateString('id-ID')}</TableCell>
                <TableCell>{getStatusBadge(billing.status)}</TableCell>
                <TableCell>{billing.month || '-'}</TableCell>
                <TableCell className="text-right space-x-2">
                  {billing.status !== 'PAID' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setPaymentDialog(billing)}
                      title="Record Payment"
                    >
                      <DollarSign className="h-4 w-4 text-green-500" />
                    </Button>
                  )}
                  <form action={async () => {
                    if (confirm('Are you sure?')) {
                      await deleteBilling(billing.id)
                    }
                  }} className="inline">
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

      <Dialog open={!!paymentDialog} onOpenChange={() => setPaymentDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Student</Label>
              <div className="col-span-3">{paymentDialog?.santri.nama}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Bill Amount</Label>
              <div className="col-span-3">Rp {paymentDialog?.amount.toLocaleString('id-ID')}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="paymentAmount" className="text-right">
                Payment Amount *
              </Label>
              <Input
                id="paymentAmount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Method *</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="TRANSFER">Transfer</SelectItem>
                  <SelectItem value="CARD">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="receiptNumber" className="text-right">
                Receipt No *
              </Label>
              <Input
                id="receiptNumber"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handlePayment}>Record Payment</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

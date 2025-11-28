import { getPayments } from "@/actions/billing-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import PaymentTable from "@/components/finance/payment-table"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function PaymentsPage() {
  const payments = await getPayments()

  const stats = {
    total: payments.length,
    totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
    cash: payments.filter(p => p.paymentMethod === 'CASH').length,
    transfer: payments.filter(p => p.paymentMethod === 'TRANSFER').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Payment History</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {stats.totalAmount.toLocaleString('id-ID')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cash}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transfer Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.transfer}</div>
          </CardContent>
        </Card>
      </div>

      <PaymentTable payments={payments} />
    </div>
  )
}

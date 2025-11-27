import { getBillings, getBillingCategories, getFinancialSummary } from "@/actions/billing-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AddBillingDialog } from "@/components/finance/add-billing-dialog"
import BillingTable from "@/components/finance/billing-table"

export default async function BillingPage() {
  const [billings, categories, summary] = await Promise.all([
    getBillings(),
    getBillingCategories(),
    getFinancialSummary()
  ])

  const stats = {
    total: billings.length,
    paid: billings.filter(b => b.status === 'PAID').length,
    unpaid: billings.filter(b => b.status === 'UNPAID').length,
    overdue: billings.filter(b => b.status === 'OVERDUE').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Billing Management</h1>
        <AddBillingDialog categories={categories} />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unpaid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.unpaid}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {summary.totalIncome.toLocaleString('id-ID')}</div>
          </CardContent>
        </Card>
      </div>

      <BillingTable billings={billings} />
    </div>
  )
}

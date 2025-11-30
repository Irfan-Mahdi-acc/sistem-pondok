import { 
  getGlobalFinancialSummary,
  getGlobalFinancialByCategory
} from "@/actions/bookkeeping-transaction-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DateRangeFilter } from "@/components/bookkeeping/date-range-filter"
import { BookkeepingPieChart } from "@/components/bookkeeping/bookkeeping-pie-chart"
import { TrendingUp, TrendingDown, Wallet, BarChart3 } from "lucide-react"

export default async function FinancialReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ startDate?: string; endDate?: string }>
}) {
  const search = await searchParams
  const startDate = search.startDate ? new Date(search.startDate) : undefined
  const endDate = search.endDate ? new Date(search.endDate) : undefined

  const [summary, incomeByCategory, expenseByCategory] = await Promise.all([
    getGlobalFinancialSummary(startDate, endDate),
    getGlobalFinancialByCategory('INCOME', startDate, endDate),
    getGlobalFinancialByCategory('EXPENSE', startDate, endDate)
  ])

  if (!summary) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Laporan Keuangan</h1>
        <p className="text-muted-foreground">Anda tidak memiliki akses ke data keuangan.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Laporan Keuangan
          </h1>
          <p className="text-muted-foreground">
            Ringkasan keuangan dari semua pembukuan yang Anda akses
          </p>
        </div>
        <DateRangeFilter />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              Rp {summary.totalIncome.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.incomeCount} transaksi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              Rp {summary.totalExpense.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.expenseCount} transaksi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Bersih</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              summary.balance >= 0 ? 'text-blue-600' : 'text-red-600'
            }`}>
              Rp {summary.balance.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.totalTransactions} total transaksi
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {(incomeByCategory.length > 0 || expenseByCategory.length > 0) ? (
        <BookkeepingPieChart 
          incomeData={incomeByCategory} 
          expenseData={expenseByCategory} 
        />
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Belum ada data transaksi untuk periode ini
          </CardContent>
        </Card>
      )}
    </div>
  )
}

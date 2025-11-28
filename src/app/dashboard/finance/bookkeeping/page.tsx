import { getBookkeepingReport, getMonthlyReport } from "@/actions/bookkeeping-actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, CreditCard } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"

// Force dynamic rendering - prevent static generation during build
export const dynamic = 'force-dynamic'

export default async function BookkeepingPage() {
  const currentYear = new Date().getFullYear()
  const [report, monthlyData] = await Promise.all([
    getBookkeepingReport(),
    getMonthlyReport(currentYear)
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pembukuan</h1>
        <p className="text-muted-foreground">
          Laporan keuangan dan pembukuan
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              Rp {report.summary.totalIncome.toLocaleString('id-ID')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              Rp {report.summary.totalExpense.toLocaleString('id-ID')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${report.summary.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              Rp {report.summary.balance.toLocaleString('id-ID')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tagihan Terbayar</CardTitle>
            <CreditCard className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              Rp {report.summary.paidBillings.toLocaleString('id-ID')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Report */}
      <Card>
        <CardHeader>
          <CardTitle>Laporan Bulanan {currentYear}</CardTitle>
          <CardDescription>Ringkasan pemasukan dan pengeluaran per bulan</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bulan</TableHead>
                <TableHead className="text-right">Pemasukan</TableHead>
                <TableHead className="text-right">Pengeluaran</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyData.map((data) => (
                <TableRow key={data.month}>
                  <TableCell className="font-medium">{data.monthName}</TableCell>
                  <TableCell className="text-right text-green-600">
                    Rp {data.income.toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    Rp {data.expense.toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell className={`text-right font-bold ${data.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    Rp {data.balance.toLocaleString('id-ID')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Income by Category */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pemasukan per Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(report.incomeByCategory).map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm">{category}</span>
                  <Badge variant="outline" className="text-green-600">
                    Rp {amount.toLocaleString('id-ID')}
                  </Badge>
                </div>
              ))}
              {Object.keys(report.incomeByCategory).length === 0 && (
                <p className="text-sm text-muted-foreground">Belum ada data</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pengeluaran per Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(report.expenseByCategory).map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm">{category}</span>
                  <Badge variant="outline" className="text-red-600">
                    Rp {amount.toLocaleString('id-ID')}
                  </Badge>
                </div>
              ))}
              {Object.keys(report.expenseByCategory).length === 0 && (
                <p className="text-sm text-muted-foreground">Belum ada data</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transaksi Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.transactions.slice(0, 10).map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {format(new Date(transaction.date), 'dd MMM yyyy', { locale: localeId })}
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>{transaction.category.name}</TableCell>
                  <TableCell>
                    <Badge variant={transaction.type === 'INCOME' ? 'default' : 'destructive'}>
                      {transaction.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}
                    </Badge>
                  </TableCell>
                  <TableCell className={`text-right font-medium ${transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                    Rp {transaction.amount.toLocaleString('id-ID')}
                  </TableCell>
                </TableRow>
              ))}
              {report.transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Belum ada transaksi
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

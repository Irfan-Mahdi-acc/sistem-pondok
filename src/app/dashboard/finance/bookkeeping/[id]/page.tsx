import { getBookkeepingById } from "@/actions/bookkeeping-management-actions"
import { 
  getBookkeepingTransactions, 
  getBookkeepingSummary,
  getBookkeepingByCategory
} from "@/actions/bookkeeping-transaction-actions"
import { getClosedPeriods } from "@/actions/bookkeeping-period-actions"
import { getTransactionCategories } from "@/actions/transaction-actions"
import { getBookkeepingAccess } from "@/lib/bookkeeping-permissions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookkeepingTransactionTable } from "@/components/bookkeeping/bookkeeping-transaction-table"
import { AddTransactionDialog } from "@/components/bookkeeping/add-transaction-dialog"
import { DateRangeFilter } from "@/components/bookkeeping/date-range-filter"
import { ExportExcelButton } from "@/components/bookkeeping/export-excel-button"
import { ClosePeriodDialog } from "@/components/bookkeeping/close-period-dialog"
import { BookkeepingPieChart } from "@/components/bookkeeping/bookkeeping-pie-chart"
import { ArrowLeft, TrendingUp, TrendingDown, Wallet, Users } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function BookkeepingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ startDate?: string; endDate?: string }>
}) {
  const { id } = await params
  const search = await searchParams
  
  const bookkeeping = await getBookkeepingById(id)
  
  if (!bookkeeping) {
    notFound()
  }

  const access = await getBookkeepingAccess(id)
  
  if (!access.canView) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-lg font-medium mb-2">Akses Ditolak</p>
            <p className="text-sm text-muted-foreground mb-4">
              Anda tidak memiliki akses ke pembukuan ini
            </p>
            <Link href="/dashboard/finance/bookkeeping-management">
              <Button variant="outline">Kembali</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const startDate = search.startDate ? new Date(search.startDate) : undefined
  const endDate = search.endDate ? new Date(search.endDate) : undefined

  const [
    transactions, 
    summary, 
    categories, 
    incomeByCategory, 
    expenseByCategory,
    closedPeriods
  ] = await Promise.all([
    getBookkeepingTransactions(id, startDate, endDate),
    getBookkeepingSummary(id, startDate, endDate),
    getTransactionCategories(),
    getBookkeepingByCategory(id, 'INCOME', startDate, endDate),
    getBookkeepingByCategory(id, 'EXPENSE', startDate, endDate),
    getClosedPeriods(id)
  ])

  const getTypeBadge = (type: string) => {
    const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
      UMUM: { label: 'Umum', variant: 'default' },
      LEMBAGA: { label: 'Lembaga', variant: 'secondary' },
      CUSTOM: { label: 'Custom', variant: 'outline' },
    }
    const config = variants[type] || { label: type, variant: 'default' }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/dashboard/finance/bookkeeping-management">
          <Button variant="ghost" size="sm" className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </Link>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold">{bookkeeping.name}</h1>
              {getTypeBadge(bookkeeping.type)}
              {access.role && (
                <Badge variant="outline" className="text-xs">
                  {access.role}
                </Badge>
              )}
            </div>
            {bookkeeping.description && (
              <p className="text-muted-foreground">{bookkeeping.description}</p>
            )}
            {bookkeeping.lembaga && (
              <p className="text-sm text-muted-foreground mt-1">
                Lembaga: <strong>{bookkeeping.lembaga.name}</strong>
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {access.role === 'MANAGER' && (
              <ClosePeriodDialog bookkeepingId={id} />
            )}
            <ExportExcelButton 
              bookkeepingId={id} 
              bookkeepingName={bookkeeping.name} 
            />
            {access.canEdit && (
              <AddTransactionDialog 
                bookkeepingId={id} 
                categories={categories}
              />
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <DateRangeFilter />
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
              Rp {summary?.totalIncome.toLocaleString('id-ID') || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary?.incomeCount || 0} transaksi
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
              Rp {summary?.totalExpense.toLocaleString('id-ID') || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary?.expenseCount || 0} transaksi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              (summary?.balance || 0) >= 0 ? 'text-blue-600' : 'text-red-600'
            }`}>
              Rp {summary?.balance.toLocaleString('id-ID') || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary?.totalTransactions || 0} total transaksi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pengurus</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {bookkeeping.assignments.length}
            </div>
            <p className="text-xs text-muted-foreground">
              orang di-assign
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {(incomeByCategory.length > 0 || expenseByCategory.length > 0) && (
        <BookkeepingPieChart 
          incomeData={incomeByCategory} 
          expenseData={expenseByCategory} 
        />
      )}

      {/* Assigned Users */}
      {bookkeeping.assignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pengurus yang Di-assign</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {bookkeeping.assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-muted/50"
                >
                  <div className="text-sm">
                    <div className="font-medium">{assignment.user.name}</div>
                    <div className="text-xs text-muted-foreground">{assignment.user.role}</div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {assignment.role}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          <BookkeepingTransactionTable
            transactions={transactions}
            bookkeepingId={id}
            canEdit={access.canEdit}
            categories={categories}
            closedPeriods={closedPeriods}
          />
        </CardContent>
      </Card>
    </div>
  )
}


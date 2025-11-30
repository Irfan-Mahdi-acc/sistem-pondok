'use client'

import { useMemo } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CategoryData {
  name: string
  value: number
  color: string
}

interface BookkeepingPieChartProps {
  incomeData: CategoryData[]
  expenseData: CategoryData[]
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', 
  '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1',
  '#a4de6c', '#d0ed57', '#83a6ed', '#8e43e7'
]

export function BookkeepingPieChart({ incomeData, expenseData }: BookkeepingPieChartProps) {
  const formattedIncomeData = useMemo(() => {
    return incomeData.map((item, index) => ({
      ...item,
      color: COLORS[index % COLORS.length]
    }))
  }, [incomeData])

  const formattedExpenseData = useMemo(() => {
    return expenseData.map((item, index) => ({
      ...item,
      color: COLORS[index % COLORS.length]
    }))
  }, [expenseData])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-2 shadow-md text-sm">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-muted-foreground">
            Rp {payload[0].value.toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-muted-foreground">
            {((payload[0].percent || 0) * 100).toFixed(1)}%
          </p>
        </div>
      )
    }
    return null
  }

  if (incomeData.length === 0 && expenseData.length === 0) {
    return null
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {incomeData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pemasukan per Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={formattedIncomeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {formattedIncomeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {expenseData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pengeluaran per Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={formattedExpenseData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {formattedExpenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

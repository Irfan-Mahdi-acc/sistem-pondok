'use server'

import { prisma } from "@/lib/prisma"

export async function getBookkeepingReport(
  startDate?: Date,
  endDate?: Date
) {
  const whereClause = {
    ...(startDate && endDate ? {
      date: {
        gte: startDate,
        lte: endDate
      }
    } : {})
  }

  const [transactions, payments, billings] = await Promise.all([
    prisma.transaction.findMany({
      where: whereClause,
      include: { category: true },
      orderBy: { date: 'desc' }
    }),
    prisma.payment.findMany({
      where: startDate && endDate ? {
        paymentDate: {
          gte: startDate,
          lte: endDate
        }
      } : {},
      include: {
        billing: {
          include: {
            santri: true,
            category: true
          }
        }
      },
      orderBy: { paymentDate: 'desc' }
    }),
    prisma.billing.findMany({
      where: startDate && endDate ? {
        dueDate: {
          gte: startDate,
          lte: endDate
        }
      } : {},
      include: {
        santri: true,
        category: true,
        payments: true
      }
    })
  ])

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0)
    
  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0)
    
  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0)
  
  const totalBillings = billings.reduce((sum, b) => sum + b.amount, 0)
  
  const paidBillings = billings
    .filter(b => b.status === 'PAID')
    .reduce((sum, b) => sum + b.amount, 0)
    
  const unpaidBillings = billings
    .filter(b => b.status === 'UNPAID' || b.status === 'OVERDUE')
    .reduce((sum, b) => sum + b.amount, 0)

  // Income by category
  const incomeByCategory = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((acc, t) => {
      const category = t.category.name
      if (!acc[category]) {
        acc[category] = 0
      }
      acc[category] += t.amount
      return acc
    }, {} as Record<string, number>)

  // Expense by category
  const expenseByCategory = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, t) => {
      const category = t.category.name
      if (!acc[category]) {
        acc[category] = 0
      }
      acc[category] += t.amount
      return acc
    }, {} as Record<string, number>)

  return {
    summary: {
      totalIncome: totalIncome + totalPayments,
      totalExpense,
      balance: (totalIncome + totalPayments) - totalExpense,
      totalPayments,
      totalBillings,
      paidBillings,
      unpaidBillings,
    },
    transactions,
    payments,
    billings,
    incomeByCategory,
    expenseByCategory,
  }
}

export async function getMonthlyReport(year: number) {
  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  
  const monthlyData = await Promise.all(
    months.map(async (month) => {
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0, 23, 59, 59)
      
      const [transactions, payments] = await Promise.all([
        prisma.transaction.findMany({
          where: {
            date: {
              gte: startDate,
              lte: endDate
            }
          }
        }),
        prisma.payment.findMany({
          where: {
            paymentDate: {
              gte: startDate,
              lte: endDate
            }
          }
        })
      ])
      
      const income = transactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0) +
        payments.reduce((sum, p) => sum + p.amount, 0)
        
      const expense = transactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0)
      
      return {
        month,
        monthName: new Date(year, month - 1).toLocaleString('id-ID', { month: 'long' }),
        income,
        expense,
        balance: income - expense
      }
    })
  )
  
  return monthlyData
}



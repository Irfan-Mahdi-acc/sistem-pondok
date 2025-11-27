'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Transaction Category Actions
export async function getTransactionCategories(type?: 'INCOME' | 'EXPENSE') {
  return await prisma.transactionCategory.findMany({
    where: type ? { type } : {},
    orderBy: { name: 'asc' }
  })
}

export async function createTransactionCategory(name: string, type: 'INCOME' | 'EXPENSE', description?: string) {
  try {
    await prisma.transactionCategory.create({
      data: {
        name,
        type,
        description: description || null
      }
    })
    revalidatePath('/dashboard/finance/settings')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to create category' }
  }
}

// Transaction Actions
const TransactionSchema = z.object({
  categoryId: z.string().min(1),
  amount: z.coerce.number().positive(),
  type: z.string(),
  date: z.string(),
  description: z.string().min(1),
  reference: z.string().optional(),
  recordedBy: z.string().optional(),
})

export async function getTransactions(filters?: {
  type?: 'INCOME' | 'EXPENSE'
  categoryId?: string
  startDate?: Date
  endDate?: Date
}) {
  return await prisma.transaction.findMany({
    where: {
      ...(filters?.type && { type: filters.type }),
      ...(filters?.categoryId && { categoryId: filters.categoryId }),
      ...(filters?.startDate && filters?.endDate && {
        date: {
          gte: filters.startDate,
          lte: filters.endDate
        }
      })
    },
    include: {
      category: true
    },
    orderBy: { date: 'desc' }
  })
}

export async function createTransaction(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries())
  const validatedData = TransactionSchema.safeParse(rawData)

  if (!validatedData.success) {
    return { success: false, error: validatedData.error.flatten() }
  }

  try {
    const data = validatedData.data
    await prisma.transaction.create({
      data: {
        categoryId: data.categoryId,
        amount: data.amount,
        type: data.type,
        date: new Date(data.date),
        description: data.description,
        reference: data.reference || null,
        recordedBy: data.recordedBy || null
      }
    })

    revalidatePath('/dashboard/finance/transactions')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Failed to create transaction' }
  }
}

export async function deleteTransaction(id: string) {
  try {
    await prisma.transaction.delete({
      where: { id },
    })
    revalidatePath('/dashboard/finance/transactions')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete transaction' }
  }
}

// Financial Reports
export async function getFinancialReport(startDate: Date, endDate: Date) {
  const transactions = await prisma.transaction.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      category: true
    }
  })

  const income = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0)

  const expense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = income - expense

  const incomeByCategory = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((acc, t) => {
      const key = t.category.name
      acc[key] = (acc[key] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)

  const expenseByCategory = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, t) => {
      const key = t.category.name
      acc[key] = (acc[key] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)

  return {
    income,
    expense,
    balance,
    incomeByCategory,
    expenseByCategory,
    transactions
  }
}

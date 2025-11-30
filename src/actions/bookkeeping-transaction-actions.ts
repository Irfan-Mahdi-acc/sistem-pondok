'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getBookkeepingAccess, getAccessibleBookkeepingIds } from "@/lib/bookkeeping-permissions"
import { isDateInClosedPeriod } from "./bookkeeping-period-actions"

// Get transactions for a specific bookkeeping
export async function getBookkeepingTransactions(
  bookkeepingId: string,
  startDate?: Date,
  endDate?: Date
) {
  const access = await getBookkeepingAccess(bookkeepingId)
  if (!access.canView) return []

  const where: any = { bookkeepingId }

  if (startDate && endDate) {
    where.date = {
      gte: startDate,
      lte: endDate,
    }
  }

  return await prisma.transaction.findMany({
    where,
    include: {
      category: true
    },
    orderBy: { date: 'desc' }
  })
}

// Create transaction in bookkeeping
export async function createBookkeepingTransaction(
  bookkeepingId: string,
  formData: FormData
) {
  const access = await getBookkeepingAccess(bookkeepingId)
  if (!access.canEdit) {
    return { success: false, error: 'Tidak memiliki izin untuk menambah transaksi' }
  }

  const date = new Date(formData.get('date') as string)
  
  // Check if date is in closed period
  const isClosed = await isDateInClosedPeriod(bookkeepingId, date)
  if (isClosed) {
    return { success: false, error: 'Periode transaksi ini sudah ditutup' }
  }

  try {
    await prisma.transaction.create({
      data: {
        bookkeepingId,
        categoryId: formData.get('categoryId') as string,
        amount: parseFloat(formData.get('amount') as string),
        type: formData.get('type') as string,
        date: date,
        description: formData.get('description') as string,
        reference: formData.get('reference') as string || null,
        recordedBy: formData.get('recordedBy') as string || null,
      }
    })

    revalidatePath(`/dashboard/finance/bookkeeping/${bookkeepingId}`)
    return { success: true }
  } catch (error) {
    console.error('Create transaction error:', error)
    return { success: false, error: 'Gagal menambahkan transaksi' }
  }
}

// Update transaction
export async function updateBookkeepingTransaction(
  transactionId: string,
  bookkeepingId: string,
  formData: FormData
) {
  const access = await getBookkeepingAccess(bookkeepingId)
  if (!access.canEdit) {
    return { success: false, error: 'Tidak memiliki izin untuk mengedit transaksi' }
  }

  const date = new Date(formData.get('date') as string)

  // Check if new date is in closed period
  const isClosed = await isDateInClosedPeriod(bookkeepingId, date)
  if (isClosed) {
    return { success: false, error: 'Periode tanggal baru sudah ditutup' }
  }

  // Check if original transaction date was in closed period
  const originalTransaction = await prisma.transaction.findUnique({
    where: { id: transactionId }
  })
  
  if (originalTransaction) {
    const isOriginalClosed = await isDateInClosedPeriod(bookkeepingId, originalTransaction.date)
    if (isOriginalClosed) {
      return { success: false, error: 'Transaksi asli berada dalam periode yang sudah ditutup' }
    }
  }

  try {
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        categoryId: formData.get('categoryId') as string,
        amount: parseFloat(formData.get('amount') as string),
        type: formData.get('type') as string,
        date: date,
        description: formData.get('description') as string,
        reference: formData.get('reference') as string || null,
      }
    })

    revalidatePath(`/dashboard/finance/bookkeeping/${bookkeepingId}`)
    return { success: true }
  } catch (error) {
    console.error('Update transaction error:', error)
    return { success: false, error: 'Gagal mengupdate transaksi' }
  }
}

// Delete transaction
export async function deleteBookkeepingTransaction(
  transactionId: string,
  bookkeepingId: string
) {
  const access = await getBookkeepingAccess(bookkeepingId)
  if (!access.canEdit) {
    return { success: false, error: 'Tidak memiliki izin untuk menghapus transaksi' }
  }

  // Check if transaction is in closed period
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId }
  })
  
  if (transaction) {
    const isClosed = await isDateInClosedPeriod(bookkeepingId, transaction.date)
    if (isClosed) {
      return { success: false, error: 'Transaksi berada dalam periode yang sudah ditutup' }
    }
  }

  try {
    await prisma.transaction.delete({
      where: { id: transactionId }
    })

    revalidatePath(`/dashboard/finance/bookkeeping/${bookkeepingId}`)
    return { success: true }
  } catch (error) {
    console.error('Delete transaction error:', error)
    return { success: false, error: 'Gagal menghapus transaksi' }
  }
}

// Get bookkeeping summary
export async function getBookkeepingSummary(
  bookkeepingId: string,
  startDate?: Date,
  endDate?: Date
) {
  const access = await getBookkeepingAccess(bookkeepingId)
  if (!access.canView) return null

  const where: any = { bookkeepingId }

  if (startDate && endDate) {
    where.date = { gte: startDate, lte: endDate }
  }

  const [income, expense, transactions] = await Promise.all([
    prisma.transaction.aggregate({
      where: { ...where, type: 'INCOME' },
      _sum: { amount: true },
      _count: true
    }),
    prisma.transaction.aggregate({
      where: { ...where, type: 'EXPENSE' },
      _sum: { amount: true },
      _count: true
    }),
    prisma.transaction.count({ where })
  ])

  const totalIncome = income._sum.amount || 0
  const totalExpense = expense._sum.amount || 0
  const balance = totalIncome - totalExpense

  return {
    totalIncome,
    totalExpense,
    balance,
    incomeCount: income._count,
    expenseCount: expense._count,
    totalTransactions: transactions
  }
}

// Get transactions aggregated by category for charts
export async function getBookkeepingByCategory(
  bookkeepingId: string,
  type: 'INCOME' | 'EXPENSE',
  startDate?: Date,
  endDate?: Date
) {
  const access = await getBookkeepingAccess(bookkeepingId)
  if (!access.canView) return []

  const where: any = { 
    bookkeepingId,
    type
  }

  if (startDate && endDate) {
    where.date = { gte: startDate, lte: endDate }
  }

  const transactions = await prisma.transaction.groupBy({
    by: ['categoryId'],
    where,
    _sum: {
      amount: true
    }
  })

  // Get category details
  const categories = await prisma.transactionCategory.findMany({
    where: {
      id: {
        in: transactions.map(t => t.categoryId)
      }
    }
  })

  return transactions.map(t => {
    const category = categories.find(c => c.id === t.categoryId)
    return {
      name: category?.name || 'Unknown',
      value: t._sum.amount || 0,
      color: '#8884d8' // Default color, will be assigned in UI
    }
  }).sort((a, b) => b.value - a.value)
}

// Get global financial summary (across all bookkeepings)
export async function getGlobalFinancialSummary(
  startDate?: Date,
  endDate?: Date
) {
  const access = await getAccessibleBookkeepingIds()
  if (access.length === 0) return null

  const where: any = {
    bookkeepingId: { in: access }
  }

  if (startDate && endDate) {
    where.date = { gte: startDate, lte: endDate }
  }

  const [income, expense, transactions] = await Promise.all([
    prisma.transaction.aggregate({
      where: { ...where, type: 'INCOME' },
      _sum: { amount: true },
      _count: true
    }),
    prisma.transaction.aggregate({
      where: { ...where, type: 'EXPENSE' },
      _sum: { amount: true },
      _count: true
    }),
    prisma.transaction.count({ where })
  ])

  const totalIncome = income._sum.amount || 0
  const totalExpense = expense._sum.amount || 0
  const balance = totalIncome - totalExpense

  return {
    totalIncome,
    totalExpense,
    balance,
    incomeCount: income._count,
    expenseCount: expense._count,
    totalTransactions: transactions
  }
}

// Get global financial data by category
export async function getGlobalFinancialByCategory(
  type: 'INCOME' | 'EXPENSE',
  startDate?: Date,
  endDate?: Date
) {
  const access = await getAccessibleBookkeepingIds()
  if (access.length === 0) return []

  const where: any = {
    bookkeepingId: { in: access },
    type
  }

  if (startDate && endDate) {
    where.date = { gte: startDate, lte: endDate }
  }

  const transactions = await prisma.transaction.groupBy({
    by: ['categoryId'],
    where,
    _sum: {
      amount: true
    }
  })

  // Get category details
  const categories = await prisma.transactionCategory.findMany({
    where: {
      id: {
        in: transactions.map(t => t.categoryId)
      }
    }
  })

  return transactions.map(t => {
    const category = categories.find(c => c.id === t.categoryId)
    return {
      name: category?.name || 'Unknown',
      value: t._sum.amount || 0,
      color: '#8884d8'
    }
  }).sort((a, b) => b.value - a.value)
}


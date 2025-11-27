'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Billing Category Actions
export async function getBillingCategories() {
  return await prisma.billingCategory.findMany({
    orderBy: { name: 'asc' }
  })
}

export async function createBillingCategory(name: string, description?: string, isRecurring?: boolean) {
  try {
    await prisma.billingCategory.create({
      data: {
        name,
        description: description || null,
        isRecurring: isRecurring || false
      }
    })
    revalidatePath('/dashboard/finance/settings')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to create category' }
  }
}

// Billing Actions
const BillingSchema = z.object({
  santriId: z.string().min(1),
  categoryId: z.string().min(1),
  amount: z.coerce.number().positive(),
  dueDate: z.string(),
  description: z.string().optional(),
  academicYear: z.string().optional(),
  month: z.string().optional(),
})

export async function getBillings(filters?: {
  santriId?: string
  status?: string
  categoryId?: string
}) {
  return await prisma.billing.findMany({
    where: {
      ...(filters?.santriId && { santriId: filters.santriId }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.categoryId && { categoryId: filters.categoryId }),
    },
    include: {
      santri: {
        include: {
          kelas: true
        }
      },
      category: true,
      payments: true
    },
    orderBy: { dueDate: 'desc' }
  })
}

export async function createBilling(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries())
  const validatedData = BillingSchema.safeParse(rawData)

  if (!validatedData.success) {
    return { success: false, error: validatedData.error.flatten() }
  }

  try {
    const data = validatedData.data
    await prisma.billing.create({
      data: {
        santriId: data.santriId,
        categoryId: data.categoryId,
        amount: data.amount,
        dueDate: new Date(data.dueDate),
        description: data.description || null,
        academicYear: data.academicYear || null,
        month: data.month || null,
        status: 'UNPAID'
      }
    })

    revalidatePath('/dashboard/finance/billing')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Failed to create billing' }
  }
}

export async function createBulkBilling(
  santriIds: string[],
  categoryId: string,
  amount: number,
  dueDate: Date,
  academicYear?: string,
  month?: string
) {
  try {
    await prisma.billing.createMany({
      data: santriIds.map(santriId => ({
        santriId,
        categoryId,
        amount,
        dueDate,
        academicYear: academicYear || null,
        month: month || null,
        status: 'UNPAID'
      }))
    })

    revalidatePath('/dashboard/finance/billing')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to create bulk billing' }
  }
}

export async function deleteBilling(id: string) {
  try {
    await prisma.billing.delete({
      where: { id },
    })
    revalidatePath('/dashboard/finance/billing')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete billing' }
  }
}

// Payment Actions
export async function recordPayment(
  billingId: string,
  amount: number,
  paymentMethod: string,
  receiptNumber: string,
  note?: string,
  recordedBy?: string
) {
  try {
    // Create payment record
    await prisma.payment.create({
      data: {
        billingId,
        amount,
        paymentMethod,
        receiptNumber,
        note: note || null,
        recordedBy: recordedBy || null
      }
    })

    // Get billing and calculate total paid
    const billing = await prisma.billing.findUnique({
      where: { id: billingId },
      include: { payments: true }
    })

    if (billing) {
      const totalPaid = billing.payments.reduce((sum, p) => sum + p.amount, 0)
      const newStatus = totalPaid >= billing.amount ? 'PAID' : 'PARTIAL'

      await prisma.billing.update({
        where: { id: billingId },
        data: { status: newStatus }
      })
    }

    revalidatePath('/dashboard/finance/billing')
    revalidatePath('/dashboard/finance/payments')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Failed to record payment' }
  }
}

export async function getPayments(filters?: {
  billingId?: string
  startDate?: Date
  endDate?: Date
}) {
  return await prisma.payment.findMany({
    where: {
      ...(filters?.billingId && { billingId: filters.billingId }),
      ...(filters?.startDate && filters?.endDate && {
        paymentDate: {
          gte: filters.startDate,
          lte: filters.endDate
        }
      })
    },
    include: {
      billing: {
        include: {
          santri: true,
          category: true
        }
      }
    },
    orderBy: { paymentDate: 'desc' }
  })
}

// Financial Reports
export async function getFinancialSummary(startDate?: Date, endDate?: Date) {
  const payments = await prisma.payment.findMany({
    where: startDate && endDate ? {
      paymentDate: {
        gte: startDate,
        lte: endDate
      }
    } : {},
    include: {
      billing: {
        include: {
          category: true
        }
      }
    }
  })

  const totalIncome = payments.reduce((sum, p) => sum + p.amount, 0)

  const billings = await prisma.billing.findMany({
    where: {
      status: { in: ['UNPAID', 'PARTIAL', 'OVERDUE'] }
    },
    include: {
      payments: true
    }
  })

  const totalOutstanding = billings.reduce((sum: number, b: any) => {
    const paid = b.payments?.reduce((s: number, p: any) => s + p.amount, 0) || 0
    return sum + (b.amount - paid)
  }, 0)

  return {
    totalIncome,
    totalOutstanding,
    paymentCount: payments.length,
    unpaidBillCount: billings.length
  }
}

'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getBookkeepingAccess } from "@/lib/bookkeeping-permissions"

// Close a bookkeeping period
export async function closeBookkeepingPeriod(
  bookkeepingId: string,
  periodStart: Date,
  periodEnd: Date,
  notes?: string
) {
  const access = await getBookkeepingAccess(bookkeepingId)
  if (access.role !== 'MANAGER') {
    return { success: false, error: 'Hanya Manager yang dapat menutup buku' }
  }

  try {
    // Check if there's already a closed period overlapping with this range
    const existingPeriod = await prisma.bookkeepingPeriod.findFirst({
      where: {
        bookkeepingId,
        OR: [
          {
            AND: [
              { periodStart: { lte: periodEnd } },
              { periodEnd: { gte: periodStart } }
            ]
          }
        ]
      }
    })

    if (existingPeriod) {
      return { 
        success: false, 
        error: 'Terdapat periode tutup buku yang tumpang tindih dengan rentang tanggal ini' 
      }
    }

    await prisma.bookkeepingPeriod.create({
      data: {
        bookkeepingId,
        periodStart,
        periodEnd,
        notes,
        closedBy: access.userId || 'System' // Should be the actual user ID
      }
    })

    revalidatePath(`/dashboard/finance/bookkeeping/${bookkeepingId}`)
    return { success: true }
  } catch (error) {
    console.error('Close period error:', error)
    return { success: false, error: 'Gagal menutup buku' }
  }
}

// Get closed periods for a bookkeeping
export async function getClosedPeriods(bookkeepingId: string) {
  const access = await getBookkeepingAccess(bookkeepingId)
  if (!access.canView) return []

  return await prisma.bookkeepingPeriod.findMany({
    where: { bookkeepingId },
    orderBy: { periodStart: 'desc' }
  })
}

// Check if a date is in a closed period
export async function isDateInClosedPeriod(bookkeepingId: string, date: Date) {
  const period = await prisma.bookkeepingPeriod.findFirst({
    where: {
      bookkeepingId,
      periodStart: { lte: date },
      periodEnd: { gte: date }
    }
  })

  return !!period
}

// Reopen a closed period (Optional - for Manager only)
export async function reopenPeriod(periodId: string, bookkeepingId: string) {
  const access = await getBookkeepingAccess(bookkeepingId)
  if (access.role !== 'MANAGER') {
    return { success: false, error: 'Hanya Manager yang dapat membuka kembali buku' }
  }

  try {
    await prisma.bookkeepingPeriod.delete({
      where: { id: periodId }
    })

    revalidatePath(`/dashboard/finance/bookkeeping/${bookkeepingId}`)
    return { success: true }
  } catch (error) {
    console.error('Reopen period error:', error)
    return { success: false, error: 'Gagal membuka kembali buku' }
  }
}

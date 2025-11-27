'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getIbadahRecords(santriId: string, date: Date) {
  try {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const records = await prisma.ibadahRecord.findMany({
      where: {
        santriId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    })
    return records
  } catch (error) {
    console.error("Error fetching ibadah records:", error)
    return []
  }
}

export async function upsertIbadahRecord(data: {
  santriId: string
  date: Date
  prayer: string
  status: string
  notes?: string
}) {
  try {
    // Ensure date is stored as date only (no time component issues for uniqueness)
    // Actually, Prisma DateTime includes time. We should probably normalize the date to start of day or handle it carefully.
    // For simplicity in this action, we rely on the unique constraint [santriId, date, prayer].
    // However, 'date' passed from client might have time.
    // Ideally, we should store 'date' as YYYY-MM-DD string or normalize the Date object.
    // Given the schema uses DateTime, let's normalize to noon to avoid timezone shifts affecting the day.
    const normalizedDate = new Date(data.date)
    normalizedDate.setHours(12, 0, 0, 0)

    const record = await prisma.ibadahRecord.upsert({
      where: {
        santriId_date_prayer: {
          santriId: data.santriId,
          date: normalizedDate,
          prayer: data.prayer
        }
      },
      update: {
        status: data.status,
        notes: data.notes
      },
      create: {
        santriId: data.santriId,
        date: normalizedDate,
        prayer: data.prayer,
        status: data.status,
        notes: data.notes
      }
    })
    revalidatePath('/dashboard/aktivitas')
    return { success: true, data: record }
  } catch (error) {
    console.error("Error upserting ibadah record:", error)
    return { success: false, error: "Gagal menyimpan data ibadah" }
  }
}

export async function bulkUpsertIbadahRecords(records: {
  santriId: string
  date: Date
  prayer: string
  status: string
  notes?: string
}[]) {
  try {
    // Prisma doesn't support bulk upsert directly in a simple way for different unique keys.
    // We'll use a transaction.
    await prisma.$transaction(
      records.map(record => {
        const normalizedDate = new Date(record.date)
        normalizedDate.setHours(12, 0, 0, 0)
        
        return prisma.ibadahRecord.upsert({
          where: {
            santriId_date_prayer: {
              santriId: record.santriId,
              date: normalizedDate,
              prayer: record.prayer
            }
          },
          update: {
            status: record.status,
            notes: record.notes
          },
          create: {
            santriId: record.santriId,
            date: normalizedDate,
            prayer: record.prayer,
            status: record.status,
            notes: record.notes
          }
        })
      })
    )
    revalidatePath('/dashboard/aktivitas')
    return { success: true }
  } catch (error) {
    console.error("Error bulk upserting ibadah records:", error)
    return { success: false, error: "Gagal menyimpan data ibadah massal" }
  }
}

'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const TahfidzSchema = z.object({
  santriId: z.string().min(1),
  ustadzId: z.string().optional().or(z.literal('')),
  surah: z.string().min(1),
  ayatStart: z.coerce.number().min(1),
  ayatEnd: z.coerce.number().min(1),
  type: z.string(),
  grade: z.string().optional(),
  note: z.string().optional(),
})

export async function getTahfidzRecords(filters?: {
  santriId?: string
  halqohId?: string
  ustadzId?: string
}) {
  return await prisma.tahfidz.findMany({
    where: {
      ...(filters?.santriId && { santriId: filters.santriId }),
      ...(filters?.ustadzId && { ustadzId: filters.ustadzId }),
      ...(filters?.halqohId && { 
        santri: {
          halqohId: filters.halqohId
        }
      }),
    },
    include: {
      santri: {
        include: {
          kelas: true,
          halqoh: true
        }
      },
      ustadz: {
        include: {
          user: true
        }
      }
    },
    orderBy: { date: 'desc' }
  })
}

export async function createTahfidzRecord(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries())
  const validatedData = TahfidzSchema.safeParse(rawData)

  if (!validatedData.success) {
    return { success: false, error: validatedData.error.flatten() }
  }

  try {
    const data = validatedData.data
    await prisma.tahfidz.create({
      data: {
        santriId: data.santriId,
        ustadzId: data.ustadzId || null,
        surah: data.surah,
        ayatStart: data.ayatStart,
        ayatEnd: data.ayatEnd,
        type: data.type,
        grade: data.grade || null,
        note: data.note || null,
      }
    })

    revalidatePath('/dashboard/tahfidz')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Failed to create record' }
  }
}

export async function updateTahfidzRecord(id: string, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries())
  const validatedData = TahfidzSchema.safeParse(rawData)

  if (!validatedData.success) {
    return { success: false, error: validatedData.error.flatten() }
  }

  try {
    const data = validatedData.data
    await prisma.tahfidz.update({
      where: { id },
      data: {
        surah: data.surah,
        ayatStart: data.ayatStart,
        ayatEnd: data.ayatEnd,
        type: data.type,
        grade: data.grade || null,
        note: data.note || null,
      }
    })

    revalidatePath('/dashboard/tahfidz')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to update record' }
  }
}

export async function deleteTahfidzRecord(id: string) {
  try {
    await prisma.tahfidz.delete({
      where: { id },
    })
    revalidatePath('/dashboard/tahfidz')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete record' }
  }
}

export async function getTahfidzProgress(santriId: string) {
  const records = await prisma.tahfidz.findMany({
    where: { santriId },
    orderBy: { date: 'asc' }
  })

  // Calculate progress statistics
  const stats = {
    totalSetoran: records.filter(r => r.type === 'SETORAN').length,
    totalMurojaah: records.filter(r => r.type === 'MUROJAAH').length,
    totalTasmi: records.filter(r => r.type === 'TASMI').length,
    averageGrade: calculateAverageGrade(records),
    recentRecords: records.slice(-10)
  }

  return stats
}

function calculateAverageGrade(records: any[]) {
  const graded = records.filter(r => r.grade)
  if (graded.length === 0) return null

  const gradeValues: { [key: string]: number } = {
    'A': 4,
    'B': 3,
    'C': 2,
    'D': 1
  }

  const sum = graded.reduce((acc, r) => acc + (gradeValues[r.grade] || 0), 0)
  const avg = sum / graded.length

  if (avg >= 3.5) return 'A'
  if (avg >= 2.5) return 'B'
  if (avg >= 1.5) return 'C'
  return 'D'
}

'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const UjianHifdzSchema = z.object({
  santriId: z.string().min(1, "Santri harus dipilih"),
  ustadzId: z.string().optional().or(z.literal('')),
  surah: z.string().min(1, "Surah harus diisi"),
  ayatStart: z.coerce.number().min(1, "Ayat awal harus diisi"),
  ayatEnd: z.coerce.number().min(1, "Ayat akhir harus diisi"),
  type: z.string().default("UJIAN"),
  grade: z.string().optional(), // Nilai opsional, bisa diisi nanti
  note: z.string().optional(),
  date: z.string().optional(), // Date string from form
})

export async function getUjianHifdzRecords(filters?: {
  santriId?: string
  ustadzId?: string
  startDate?: Date
  endDate?: Date
  lembagaId?: string
  halqohId?: string
}) {
  return await prisma.tahfidz.findMany({
    where: {
      type: "UJIAN",
      ...(filters?.santriId && { santriId: filters.santriId }),
      ...(filters?.ustadzId && { ustadzId: filters.ustadzId }),
      ...(filters?.startDate && filters?.endDate && {
        date: {
          gte: filters.startDate,
          lte: filters.endDate
        }
      }),
      santri: {
        ...(filters?.lembagaId && { lembagaId: filters.lembagaId }),
        ...(filters?.halqohId && { halqohId: filters.halqohId }),
      }
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

export async function createUjianHifdzRecord(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries())
  const validatedData = UjianHifdzSchema.safeParse(rawData)

  if (!validatedData.success) {
    const errors = validatedData.error.flatten()
    const errorMessage = errors.fieldErrors.surah?.[0] || 
                        errors.fieldErrors.santriId?.[0] || 
                        'Data tidak valid'
    return { success: false, error: errorMessage }
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
        type: "UJIAN",
        grade: data.grade || null,
        note: data.note || null,
        date: data.date ? new Date(data.date) : new Date(),
      }
    })

    revalidatePath('/dashboard/academic/ujian-hifdz')
    return { success: true }
  } catch (error) {
    console.error('Failed to create ujian hifdz record:', error)
    return { success: false, error: 'Gagal menyimpan data ujian' }
  }
}

export async function updateUjianHifdzRecord(id: string, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries())
  
  // For updates, we only validate the fields that are being updated
  // Don't require santriId since it shouldn't change
  const UpdateSchema = z.object({
    surah: z.string().optional(),
    ayatStart: z.coerce.number().optional(),
    ayatEnd: z.coerce.number().optional(),
    ustadzId: z.string().optional().or(z.literal('')),
    grade: z.string().optional(),
    note: z.string().optional(),
    date: z.string().optional(),
  })

  const validatedData = UpdateSchema.safeParse(rawData)

  if (!validatedData.success) {
    const errors = validatedData.error.flatten()
    const errorMessage = errors.fieldErrors.surah?.[0] || 
                        'Data tidak valid'
    return { success: false, error: errorMessage }
  }

  try {
    const data = validatedData.data
    
    // Build update object with only provided fields
    const updateData: any = {}
    
    if (data.surah) updateData.surah = data.surah
    if (data.ayatStart !== undefined) updateData.ayatStart = data.ayatStart
    if (data.ayatEnd !== undefined) updateData.ayatEnd = data.ayatEnd
    if (data.ustadzId !== undefined) updateData.ustadzId = data.ustadzId || null
    if (data.grade !== undefined) updateData.grade = data.grade || null
    if (data.note !== undefined) updateData.note = data.note || null
    if (data.date) updateData.date = new Date(data.date)

    await prisma.tahfidz.update({
      where: { id },
      data: updateData
    })

    revalidatePath('/dashboard/academic/ujian-hifdz')
    revalidatePath(`/dashboard/academic/ujian-hifdz/santri`)
    return { success: true }
  } catch (error) {
    console.error('Failed to update ujian hifdz record:', error)
    return { success: false, error: 'Gagal mengupdate data ujian' }
  }
}

export async function deleteUjianHifdzRecord(id: string) {
  try {
    await prisma.tahfidz.delete({
      where: { id },
    })
    revalidatePath('/dashboard/academic/ujian-hifdz')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Gagal menghapus data ujian' }
  }
}

export async function getUjianHifdzStats() {
  const records = await prisma.tahfidz.findMany({
    where: { type: "UJIAN" },
    select: { grade: true }
  })

  const total = records.length
  
  // Calculate grade distribution
  const distribution = records.reduce((acc, curr) => {
    const grade = curr.grade || 'Unknown'
    acc[grade] = (acc[grade] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    total,
    distribution
  }
}

// Bulk creation for multiple exams for one santri
export async function createBulkUjianHifdz(data: {
  santriId: string
  date: string
  exams: Array<{
    examType: "JUZ" | "SURAH"
    juz?: string
    startSurah?: string
    startAyat?: string
    endSurah?: string
    endAyat?: string
    ustadzId?: string
  }>
}) {
  try {
    // Validate santri exists
    const santri = await prisma.santri.findUnique({
      where: { id: data.santriId }
    })

    if (!santri) {
      return { success: false, error: 'Santri tidak ditemukan' }
    }

    // Prepare exam records
    const examRecords = data.exams.map(exam => {
      let surah = ''
      let ayatStart = 1
      let ayatEnd = 1

      if (exam.examType === 'JUZ') {
        // For Juz, use the surah range from the exam data
        if (exam.startSurah && exam.endSurah) {
          if (exam.startSurah === exam.endSurah) {
            surah = exam.startSurah
            ayatStart = parseInt(exam.startAyat || '1')
            ayatEnd = parseInt(exam.endAyat || '1')
          } else {
            surah = `${exam.startSurah}:${exam.startAyat} - ${exam.endSurah}:${exam.endAyat}`
            ayatStart = 0
            ayatEnd = 0
          }
        } else {
          // Fallback to old format
          surah = `Juz ${exam.juz}`
          ayatStart = 1
          ayatEnd = 1
        }
      } else {
        if (exam.startSurah === exam.endSurah) {
          surah = exam.startSurah!
          ayatStart = parseInt(exam.startAyat!)
          ayatEnd = parseInt(exam.endAyat!)
        } else {
          surah = `${exam.startSurah}:${exam.startAyat} - ${exam.endSurah}:${exam.endAyat}`
          ayatStart = 0
          ayatEnd = 0
        }
      }

      return {
        santriId: data.santriId,
        ustadzId: exam.ustadzId || null,
        surah,
        ayatStart,
        ayatEnd,
        type: 'UJIAN',
        grade: null,
        note: null,
        date: new Date(data.date),
      }
    })

    // Create all records in a transaction
    await prisma.tahfidz.createMany({
      data: examRecords
    })

    revalidatePath('/dashboard/academic/ujian-hifdz')
    return { 
      success: true, 
      message: `Berhasil menambahkan ${examRecords.length} ujian untuk ${santri.nama}` 
    }
  } catch (error) {
    console.error('Failed to create bulk ujian hifdz:', error)
    return { success: false, error: 'Gagal menyimpan data ujian' }
  }
}

// Get ujian data grouped by santri
export async function getUjianHifdzBySantri(filters?: {
  lembagaId?: string
  halqohId?: string
}) {
  const santriList = await prisma.santri.findMany({
    where: {
      ...(filters?.lembagaId && { lembagaId: filters.lembagaId }),
      ...(filters?.halqohId && { halqohId: filters.halqohId }),
    },
    include: {
      kelas: true,
      halqoh: true,
      lembaga: true,
      tahfidzRecords: {
        where: { type: 'UJIAN' },
        include: {
          ustadz: {
            include: {
              user: true
            }
          }
        },
        orderBy: { date: 'desc' }
      }
    },
    orderBy: { nama: 'asc' }
  })

  // Filter only santri who have ujian records
  const santriWithUjian = santriList.filter(santri => santri.tahfidzRecords.length > 0)

  // Calculate statistics for each santri
  return santriWithUjian.map(santri => {
    const totalExams = santri.tahfidzRecords.length
    const gradedExams = santri.tahfidzRecords.filter((exam: any) => exam.grade !== null).length
    const ungradedExams = totalExams - gradedExams

    return {
      id: santri.id,
      nama: santri.nama,
      kelas: santri.kelas?.name,
      halqoh: santri.halqoh?.name,
      lembaga: santri.lembaga?.name,
      totalExams,
      gradedExams,
      ungradedExams,
      exams: santri.tahfidzRecords
    }
  })
}

// Get single santri's ujian records
export async function getSantriUjianRecords(santriId: string) {
  const santri = await prisma.santri.findUnique({
    where: { id: santriId },
    include: {
      kelas: true,
      halqoh: true,
      lembaga: true,
      tahfidzRecords: {
        where: { type: 'UJIAN' },
        include: {
          ustadz: {
            include: {
              user: true
            }
          }
        },
        orderBy: { date: 'desc' }
      }
    }
  })

  if (!santri) {
    return null
  }

  return santri
}

'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Academic Calendar Actions
const CalendarSchema = z.object({
  title: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
  description: z.string().optional(),
  type: z.string(),
  academicYear: z.string().optional(),
  lembagaId: z.string().optional().or(z.literal('')),
})

export async function getAcademicCalendars(lembagaId?: string) {
  return await prisma.academicCalendar.findMany({
    where: lembagaId ? { lembagaId } : {},
    include: {
      lembaga: true,
      eventLembagas: {
        include: {
          lembaga: true
        }
      }
    },
    orderBy: { startDate: 'asc' }
  })
}

export async function createAcademicEvent(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries())
  const lembagaIds = formData.getAll('lembagaIds') as string[] // Multi-select
  const validatedData = CalendarSchema.safeParse(rawData)

  if (!validatedData.success) {
    return { success: false, error: validatedData.error.flatten() }
  }

  try {
    const data = validatedData.data
    
    // Import color utility
    const { getRandomEventColor } = await import('@/lib/event-colors')
    const color = getRandomEventColor()
    
    await prisma.academicCalendar.create({
      data: {
        title: data.title,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        description: data.description || null,
        type: data.type,
        academicYear: data.academicYear || null,
        color, // Auto-generated unique color
        // Create EventLembaga relations if lembaga selected
        ...(lembagaIds.length > 0 && {
          eventLembagas: {
            create: lembagaIds.map(id => ({ lembagaId: id }))
          }
        }),
        // Keep backward compatibility
        lembagaId: data.lembagaId || null,
      }
    })

    revalidatePath('/dashboard/academic/calendar')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Failed to create event' }
  }
}

export async function updateAcademicEvent(id: string, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries())
  const lembagaIds = formData.getAll('lembagaIds') as string[]
  const validatedData = CalendarSchema.safeParse(rawData)

  if (!validatedData.success) {
    return { success: false, error: validatedData.error.flatten() }
  }

  try {
    const data = validatedData.data
    
    // Delete old EventLembaga relations
    await prisma.eventLembaga.deleteMany({
      where: { eventId: id }
    })
    
    // Update event with new relations
    await prisma.academicCalendar.update({
      where: { id },
      data: {
        title: data.title,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        description: data.description || null,
        type: data.type,
        academicYear: data.academicYear || null,
        // Create new EventLembaga relations
        ...(lembagaIds.length > 0 && {
          eventLembagas: {
            create: lembagaIds.map(lembagaId => ({ lembagaId }))
          }
        }),
        // Keep backward compatibility
        lembagaId: data.lembagaId || null,
      }
    })

    revalidatePath('/dashboard/academic/calendar')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to update event' }
  }
}

export async function deleteAcademicEvent(id: string) {
  try {
    await prisma.academicCalendar.delete({
      where: { id },
    })
    revalidatePath('/dashboard/academic/calendar')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete event' }
  }
}

// Exam Management Actions
const ExamSchema = z.object({
  name: z.string().min(1),
  type: z.string(),
  date: z.string(),
  mapelId: z.string().min(1),
})

export async function getExamsByMapel(mapelId: string) {
  return await prisma.ujian.findMany({
    where: { mapelId },
    include: {
      mapel: {
        include: {
          kelas: true
        }
      },
      nilais: {
        include: {
          santri: true
        }
      }
    },
    orderBy: { date: 'desc' }
  })
}

export async function getExamsByKelas(kelasId: string) {
  return await prisma.ujian.findMany({
    where: {
      mapel: {
        kelasId
      }
    },
    include: {
      mapel: true,
      _count: {
        select: {
          nilais: true
        }
      }
    },
    orderBy: { date: 'desc' }
  })
}

export async function createExam(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries())
  const validatedData = ExamSchema.safeParse(rawData)

  if (!validatedData.success) {
    return { success: false, error: validatedData.error.flatten() }
  }

  try {
    const data = validatedData.data
    await prisma.ujian.create({
      data: {
        name: data.name,
        type: data.type,
        date: new Date(data.date),
        mapelId: data.mapelId,
      }
    })

    revalidatePath('/dashboard/academic/exams')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Failed to create exam' }
  }
}

export async function deleteExam(id: string) {
  try {
    await prisma.ujian.delete({
      where: { id },
    })
    revalidatePath('/dashboard/academic/exams')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete exam' }
  }
}

// Grade Management Actions
export async function getExamWithGrades(examId: string) {
  return await prisma.ujian.findUnique({
    where: { id: examId },
    include: {
      mapel: {
        include: {
          kelas: {
            include: {
              santris: {
                orderBy: { nama: 'asc' }
              }
            }
          }
        }
      },
      nilais: {
        include: {
          santri: true
        }
      }
    }
  })
}

export async function saveGrade(examId: string, santriId: string, score: number) {
  try {
    const exam = await prisma.ujian.findUnique({
      where: { id: examId },
      select: { mapelId: true }
    })

    if (!exam) {
      return { success: false, error: 'Exam not found' }
    }

    // Check if grade already exists
    const existing = await prisma.nilai.findFirst({
      where: {
        ujianId: examId,
        santriId: santriId
      }
    })

    if (existing) {
      // Update existing grade
      await prisma.nilai.update({
        where: { id: existing.id },
        data: { score }
      })
    } else {
      // Create new grade
      await prisma.nilai.create({
        data: {
          score,
          santriId,
          mapelId: exam.mapelId,
          ujianId: examId
        }
      })
    }

    revalidatePath(`/dashboard/academic/exams/${examId}/grades`)
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Failed to save grade' }
  }
}

export async function getStudentGrades(santriId: string, academicYear?: string) {
  return await prisma.nilai.findMany({
    where: {
      santriId,
      // Filter by academic year if provided
    },
    include: {
      ujian: {
        include: {
          mapel: {
            include: {
              kelas: true
            }
          }
        }
      }
    },
    orderBy: {
      ujian: {
        date: 'desc'
      }
    }
  })
}

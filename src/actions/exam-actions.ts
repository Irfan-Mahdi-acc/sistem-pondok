'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Validation Schemas
const UjianSchema = z.object({
  name: z.string().min(1, "Nama ujian harus diisi"),
  type: z.enum(["HARIAN", "UTS", "UAS", "LISAN", "PRAKTEK", "HAFALAN"]),
  date: z.string().optional(),
  duration: z.coerce.number().optional(),
  description: z.string().optional(),
  mapelId: z.string().min(1, "Mata pelajaran harus dipilih"),
})

const ExamQuestionSchema = z.object({
  ujianId: z.string().min(1),
  questionBankId: z.string().optional(),
  directQuestion: z.string().optional(),
  directType: z.string().optional(),
  directOptions: z.string().optional(),
  directAnswer: z.string().optional(),
  points: z.coerce.number().min(0),
  imageUrl: z.string().optional(),
  itemType: z.string().default("QUESTION"),
})

// Exam CRUD
export async function getExamsByMapel(mapelId: string) {
  try {
    return await prisma.ujian.findMany({
      where: { mapelId },
      include: {
        mapel: {
          include: {
            kelas: {
              include: {
                lembaga: true
              }
            }
          }
        },
        _count: {
          select: { 
            questions: true,
            nilais: true 
          }
        }
      },
      orderBy: { date: 'desc' }
    })
  } catch (error) {
    console.error('Error fetching exams:', error)
    return []
  }
}

// Get exams by kelas with semester filter
export async function getExamsByKelas(
  kelasId: string,
  academicYearId?: string,
  semester?: string
) {
  try {
    const exams = await prisma.ujian.findMany({
      where: {
        mapel: {
          kelasId
        },
        ...(academicYearId && { academicYearId }),
        ...(semester && { semester })
      },
      include: {
        mapel: true,
        _count: {
          select: {
            questions: true,
            nilais: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })
    return exams
  } catch (error) {
    console.error("Error fetching exams by kelas:", error)
    return []
  }
}

export async function getExamById(id: string) {
  try {
    const exam = await prisma.ujian.findUnique({
      where: { id },
      include: {
        mapel: {
          include: {
            kelas: {
              include: {
                lembaga: true
              }
            }
          }
        },
        questions: {
          include: {
            questionBank: {
              include: {
                options: {
                  orderBy: { order: 'asc' }
                }
              }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    })
    return exam
  } catch (error) {
    console.error('Error fetching exam:', error)
    throw error
  }
}

export async function createExam(formData: FormData) {
  const rawData = {
    name: formData.get('name'),
    type: formData.get('type'),
    date: formData.get('date'),
    duration: formData.get('duration') || undefined,
    description: formData.get('description') || undefined,
    mapelId: formData.get('mapelId'),
  }

  const validatedData = UjianSchema.safeParse(rawData)

  if (!validatedData.success) {
    console.error('Validation error:', validatedData.error.flatten().fieldErrors)
    return { success: false, error: validatedData.error.flatten().fieldErrors }
  }

  try {
    const exam = await prisma.ujian.create({
      data: {
        ...validatedData.data,
        date: validatedData.data.date ? new Date(validatedData.data.date) : new Date(),
        semester: formData.get('semester') as string || undefined,
        academicYearId: formData.get('academicYearId') as string || undefined,
      },
    })
    revalidatePath('/dashboard/academic/exams')
    revalidatePath('/dashboard/academic/nilai-raport')
    return { success: true, examId: exam.id }
  } catch (error) {
    console.error('Error creating exam:', error)
    return { success: false, error: 'Gagal membuat ujian: ' + (error instanceof Error ? error.message : String(error)) }
  }
}

export async function updateExam(id: string, formData: FormData) {
  const rawData = {
    name: formData.get('name'),
    type: formData.get('type'),
    date: formData.get('date'),
    duration: formData.get('duration') || undefined,
    description: formData.get('description') || undefined,
    mapelId: formData.get('mapelId'),
  }

  const validatedData = UjianSchema.safeParse(rawData)

  if (!validatedData.success) {
    return { success: false, error: validatedData.error.flatten().fieldErrors }
  }

  try {
    await prisma.ujian.update({
      where: { id },
      data: {
        ...validatedData.data,
        date: validatedData.data.date ? new Date(validatedData.data.date) : new Date(),
      },
    })
    revalidatePath('/dashboard/academic/exams')
    return { success: true }
  } catch (error) {
    console.error('Error updating exam:', error)
    return { success: false, error: 'Gagal mengupdate ujian' }
  }
}

export async function deleteExam(id: string) {
  try {
    await prisma.ujian.delete({
      where: { id }
    })
    revalidatePath('/dashboard/academic/exams')
    return { success: true }
  } catch (error) {
    console.error('Error deleting exam:', error)
    return { success: false, error: 'Gagal menghapus ujian' }
  }
}

export async function addQuestionToExam(formData: FormData) {
  const validatedData = ExamQuestionSchema.safeParse({
    ujianId: formData.get('ujianId'),
    questionBankId: formData.get('questionBankId') || undefined,
    directQuestion: formData.get('directQuestion') || undefined,
    directType: formData.get('directType') || undefined,
    directOptions: formData.get('directOptions') || undefined,
    points: formData.get('points'),
    imageUrl: formData.get('imageUrl') || undefined,
    itemType: formData.get('itemType') || "QUESTION",
  })

  const insertAtOrder = formData.get('insertAtOrder') ? parseInt(formData.get('insertAtOrder') as string) : undefined

  if (!validatedData.success) {
    const errorMessages = validatedData.error.flatten().fieldErrors
    const firstError = Object.values(errorMessages)[0]?.[0] || "Validation error"
    return { success: false, error: firstError }
  }

  try {
    let currentOrder: number

    if (insertAtOrder !== undefined) {
      // Shift items to make space
      await prisma.examQuestion.updateMany({
        where: {
          ujianId: validatedData.data.ujianId,
          order: { gte: insertAtOrder }
        },
        data: {
          order: { increment: 1 }
        }
      })
      currentOrder = insertAtOrder
    } else {
      // Append to end
      const maxOrder = await prisma.examQuestion.aggregate({
        where: { ujianId: validatedData.data.ujianId },
        _max: { order: true }
      })
      currentOrder = (maxOrder._max.order || 0) + 1
    }

    await prisma.examQuestion.create({
      data: {
        ...validatedData.data,
        order: currentOrder,
      }
    })

    revalidatePath('/dashboard/academic/exams')
    return { success: true }
  } catch (error) {
    console.error('Error adding question to exam:', error)
    return { success: false, error: 'Gagal menambahkan soal ke ujian: ' + (error instanceof Error ? error.message : String(error)) }
  }
}

export async function updateExamQuestion(id: string, formData: FormData) {
  const validatedData = ExamQuestionSchema.safeParse({
    ujianId: formData.get('ujianId'),
    questionBankId: formData.get('questionBankId') || undefined,
    directQuestion: formData.get('directQuestion') || undefined,
    directType: formData.get('directType') || undefined,
    directOptions: formData.get('directOptions') || undefined,
    points: formData.get('points'),
    imageUrl: formData.get('imageUrl') || undefined,
    itemType: formData.get('itemType') || "QUESTION",
  })

  if (!validatedData.success) {
    const errorMessages = validatedData.error.flatten().fieldErrors
    const firstError = Object.values(errorMessages)[0]?.[0] || "Validation error"
    return { success: false, error: firstError }
  }

  try {
    await prisma.examQuestion.update({
      where: { id },
      data: validatedData.data
    })

    revalidatePath('/dashboard/academic/exams')
    return { success: true }
  } catch (error) {
    console.error('Error updating exam question:', error)
    return { success: false, error: 'Gagal mengupdate soal ujian' }
  }
}

export async function removeQuestionFromExam(id: string) {
  try {
    await prisma.examQuestion.delete({
      where: { id }
    })
    revalidatePath('/dashboard/academic/exams')
    return { success: true }
  } catch (error) {
    console.error('Error removing question from exam:', error)
    return { success: false, error: 'Gagal menghapus soal dari ujian' }
  }
}

export async function moveExamQuestion(id: string, direction: 'up' | 'down') {
  try {
    const question = await prisma.examQuestion.findUnique({
      where: { id }
    })

    if (!question) return { success: false, error: 'Soal tidak ditemukan' }

    const targetOrder = direction === 'up' ? question.order - 1 : question.order + 1

    const swapQuestion = await prisma.examQuestion.findFirst({
      where: {
        ujianId: question.ujianId,
        order: targetOrder
      }
    })

    if (swapQuestion) {
      // Swap orders
      await prisma.$transaction([
        prisma.examQuestion.update({
          where: { id: question.id },
          data: { order: targetOrder }
        }),
        prisma.examQuestion.update({
          where: { id: swapQuestion.id },
          data: { order: question.order }
        })
      ])
    }

    revalidatePath('/dashboard/academic/exams')
    return { success: true }
  } catch (error) {
    console.error('Error moving question:', error)
    return { success: false, error: 'Gagal memindahkan soal' }
  }
}

export async function reorderExamQuestions(ujianId: string, questionOrders: { id: string, order: number }[]) {
  try {
    // Update all questions with new order
    await Promise.all(
      questionOrders.map((item) =>
        prisma.examQuestion.update({
          where: { id: item.id },
          data: { order: item.order }
        })
      )
    )

    revalidatePath('/dashboard/academic/exams')
    return { success: true }
  } catch (error) {
    console.error('Error reordering questions:', error)
    return { success: false, error: 'Gagal mengubah urutan soal' }
  }
}

// Bulk add questions from bank
export async function addQuestionsFromBank(ujianId: string, questionIds: string[]) {
  try {
    // Get current max order
    const maxOrder = await prisma.examQuestion.aggregate({
      where: { ujianId },
      _max: { order: true }
    })

    let currentOrder = (maxOrder._max.order || 0) + 1

    // Get questions to get their default points
    const questions = await prisma.questionBank.findMany({
      where: { id: { in: questionIds } }
    })

    // Create exam questions
    await prisma.examQuestion.createMany({
      data: questions.map((q) => ({
        ujianId,
        questionBankId: q.id,
        order: currentOrder++,
        points: q.points,
      }))
    })

    revalidatePath('/dashboard/academic/exams')
    return { success: true }
  } catch (error) {
    console.error('Error adding questions from bank:', error)
    return { success: false, error: 'Gagal menambahkan soal dari bank' }
  }
}

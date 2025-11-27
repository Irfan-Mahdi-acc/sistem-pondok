'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Validation Schemas
const QuestionCategorySchema = z.object({
  name: z.string().min(1, "Nama kategori harus diisi"),
  description: z.string().optional(),
  mapelId: z.string().min(1, "Mata pelajaran harus dipilih"),
})

const QuestionBankSchema = z.object({
  question: z.string().min(1, "Pertanyaan harus diisi"),
  type: z.enum(["MULTIPLE_CHOICE", "ESSAY", "TRUE_FALSE"]),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  points: z.coerce.number().min(1),
  explanation: z.string().optional(),
  mapelId: z.string().min(1),
  categoryId: z.string().optional(),
  imageUrl: z.string().optional(),
})

export async function createQuestionCategory(formData: FormData) {
  const validatedData = QuestionCategorySchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    mapelId: formData.get('mapelId'),
  })

  if (!validatedData.success) {
    return { success: false, error: validatedData.error.errors[0].message }
  }

  try {
    await prisma.questionCategory.create({
      data: validatedData.data,
    })
    revalidatePath('/dashboard/academic/exams')
    return { success: true }
  } catch (error) {
    console.error('Error creating category:', error)
    return { success: false, error: 'Gagal membuat kategori' }
  }
}

export async function getQuestionCategories(mapelId: string) {
  try {
    return await prisma.questionCategory.findMany({
      where: { mapelId },
      orderBy: { name: 'asc' }
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export async function deleteQuestionCategory(id: string) {
  try {
    await prisma.questionCategory.delete({
      where: { id }
    })
    revalidatePath('/dashboard/academic/exams')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Gagal menghapus kategori' }
  }
}

export async function createQuestion(formData: FormData) {
  const validatedData = QuestionBankSchema.safeParse({
    question: formData.get('question'),
    type: formData.get('type'),
    difficulty: formData.get('difficulty'),
    points: formData.get('points'),
    explanation: formData.get('explanation'),
    mapelId: formData.get('mapelId'),
    categoryId: formData.get('categoryId') || undefined,
    imageUrl: formData.get('imageUrl') || undefined,
  })

  if (!validatedData.success) {
    return { success: false, error: validatedData.error.errors[0].message }
  }

  try {
    const optionsJson = formData.get('options')
    let options: any[] = []
    
    if (optionsJson && typeof optionsJson === 'string') {
      try {
        options = JSON.parse(optionsJson)
      } catch (e) {
        return { success: false, error: 'Format pilihan jawaban tidak valid' }
      }
    }

    await prisma.questionBank.create({
      data: {
        ...validatedData.data,
        options: {
          create: options.map((opt: any, index: number) => ({
            optionText: opt.optionText,
            isCorrect: opt.isCorrect || false,
            order: index
          }))
        }
      },
    })

    revalidatePath('/dashboard/academic/exams')
    return { success: true }
  } catch (error) {
    console.error('Error creating question:', error)
    return { success: false, error: 'Gagal membuat soal' }
  }
}

export async function updateQuestion(id: string, formData: FormData) {
  const validatedData = QuestionBankSchema.safeParse({
    question: formData.get('question'),
    type: formData.get('type'),
    difficulty: formData.get('difficulty'),
    points: formData.get('points'),
    explanation: formData.get('explanation'),
    mapelId: formData.get('mapelId'),
    categoryId: formData.get('categoryId') || undefined,
    imageUrl: formData.get('imageUrl') || undefined,
  })

  if (!validatedData.success) {
    return { success: false, error: validatedData.error.errors[0].message }
  }

  try {
    const optionsJson = formData.get('options')
    let options: any[] = []
    
    if (optionsJson && typeof optionsJson === 'string') {
      try {
        options = JSON.parse(optionsJson)
      } catch (e) {
        return { success: false, error: 'Format pilihan jawaban tidak valid' }
      }
    }

    // Delete existing options and create new ones
    await prisma.questionOption.deleteMany({
      where: { questionId: id }
    })

    await prisma.questionBank.update({
      where: { id },
      data: {
        ...validatedData.data,
        options: {
          create: options.map((opt: any, index: number) => ({
            optionText: opt.optionText,
            isCorrect: opt.isCorrect || false,
            order: index
          }))
        }
      },
    })

    revalidatePath('/dashboard/academic/exams')
    return { success: true }
  } catch (error) {
    console.error('Error updating question:', error)
    return { success: false, error: 'Gagal mengupdate soal' }
  }
}

export async function deleteQuestion(id: string) {
  try {
    await prisma.questionBank.delete({
      where: { id },
    })
    revalidatePath('/dashboard/academic/exams')
    return { success: true }
  } catch (error) {
    console.error('Error deleting question:', error)
    return { success: false, error: 'Gagal menghapus soal' }
  }
}

export async function getQuestionsByMapel(mapelId: string, search?: string) {
  try {
    return await prisma.questionBank.findMany({
      where: {
        mapelId,
        ...(search && {
          question: {
            contains: search,
            mode: 'insensitive'
          }
        })
      },
      include: {
        category: true,
        options: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  } catch (error) {
    console.error('Error fetching questions:', error)
    return []
  }
}

// Get questions for exam builder (with search and filters)
export async function getQuestionsForExam(mapelId: string, filters?: {
  categoryId?: string
  difficulty?: string
  type?: string
  search?: string
}) {
  try {
    return await prisma.questionBank.findMany({
      where: {
        mapelId,
        ...(filters?.categoryId && { categoryId: filters.categoryId }),
        ...(filters?.difficulty && { difficulty: filters.difficulty }),
        ...(filters?.type && { type: filters.type }),
        ...(filters?.search && {
          question: {
            contains: filters.search,
            mode: 'insensitive'
          }
        })
      },
      include: {
        category: true,
        options: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  } catch (error) {
    console.error('Error fetching questions for exam:', error)
    return []
  }
}

"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// Default grade weights untuk ujian umum
export const DEFAULT_GRADE_WEIGHTS = [
  { examType: "UAS", weight: 2.0, order: 1, label: "Ujian Akhir Semester" },
  { examType: "UTS", weight: 1.5, order: 2, label: "Ujian Tengah Semester" },
  { examType: "HARIAN", weight: 1.0, order: 3, label: "Ujian Harian" },
  { examType: "TUGAS", weight: 1.0, order: 4, label: "Tugas" },
  { examType: "PRAKTEK", weight: 1.0, order: 5, label: "Praktek" },
  { examType: "LISAN", weight: 1.0, order: 6, label: "Ujian Lisan" },
]

/**
 * Get all grade weights for a lembaga
 */
export async function getGradeWeights(lembagaId: string) {
  try {
    const weights = await prisma.gradeWeight.findMany({
      where: { lembagaId },
      orderBy: { order: 'asc' }
    })

    // If no weights exist, initialize with defaults
    if (weights.length === 0) {
      await initializeDefaultWeights(lembagaId)
      return await prisma.gradeWeight.findMany({
        where: { lembagaId },
        orderBy: { order: 'asc' }
      })
    }

    return weights
  } catch (error) {
    console.error("Error fetching grade weights:", error)
    throw new Error("Failed to fetch grade weights")
  }
}

/**
 * Initialize default grade weights for a lembaga
 */
export async function initializeDefaultWeights(lembagaId: string) {
  try {
    const createPromises = DEFAULT_GRADE_WEIGHTS.map(weight =>
      prisma.gradeWeight.create({
        data: {
          lembagaId,
          examType: weight.examType,
          weight: weight.weight,
          order: weight.order,
          isActive: true
        }
      })
    )

    await Promise.all(createPromises)
    revalidatePath('/dashboard')
    
    return { success: true, message: "Default weights initialized" }
  } catch (error) {
    console.error("Error initializing weights:", error)
    throw new Error("Failed to initialize weights")
  }
}

/**
 * Update a grade weight
 */
export async function updateGradeWeight(
  id: string,
  data: {
    weight?: number
    order?: number
    isActive?: boolean
  }
) {
  try {
    const updated = await prisma.gradeWeight.update({
      where: { id },
      data
    })

    revalidatePath('/dashboard')
    return { success: true, data: updated }
  } catch (error) {
    console.error("Error updating grade weight:", error)
    throw new Error("Failed to update grade weight")
  }
}

/**
 * Create a custom grade weight
 */
export async function createGradeWeight(data: {
  lembagaId: string
  examType: string
  weight: number
  order?: number
  isActive?: boolean
}) {
  try {
    const weight = await prisma.gradeWeight.create({
      data: {
        lembagaId: data.lembagaId,
        examType: data.examType,
        weight: data.weight,
        order: data.order || 99,
        isActive: data.isActive !== undefined ? data.isActive : true
      }
    })

    revalidatePath('/dashboard')
    return { success: true, data: weight }
  } catch (error) {
    console.error("Error creating grade weight:", error)
    throw new Error("Failed to create grade weight")
  }
}

/**
 * Delete a grade weight
 */
export async function deleteGradeWeight(id: string) {
  try {
    await prisma.gradeWeight.delete({
      where: { id }
    })

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error("Error deleting grade weight:", error)
    throw new Error("Failed to delete grade weight")
  }
}

/**
 * Reset weights to default
 */
export async function resetToDefaultWeights(lembagaId: string) {
  try {
    // Delete all existing weights
    await prisma.gradeWeight.deleteMany({
      where: { lembagaId }
    })

    // Initialize defaults
    await initializeDefaultWeights(lembagaId)

    revalidatePath('/dashboard')
    return { success: true, message: "Weights reset to default" }
  } catch (error) {
    console.error("Error resetting weights:", error)
    throw new Error("Failed to reset weights")
  }
}

/**
 * Get weight label for display
 */
export function getExamTypeLabel(examType: string): string {
  const defaults = DEFAULT_GRADE_WEIGHTS.find(w => w.examType === examType)
  return defaults?.label || examType
}

/**
 * Calculate weighted average for a student's grades
 * Takes array of {score, examType} and returns weighted average
 */
export async function calculateWeightedAverage(
  lembagaId: string,
  grades: Array<{ score: number; examType: string }>
): Promise<number> {
  try {
    if (grades.length === 0) return 0

    const weights = await getGradeWeights(lembagaId)
    const activeWeights = weights.filter(w => w.isActive)

    let totalWeightedScore = 0
    let totalWeight = 0

    grades.forEach(grade => {
      const weightConfig = activeWeights.find(w => w.examType === grade.examType)
      const weight = weightConfig?.weight || 1.0

      totalWeightedScore += grade.score * weight
      totalWeight += weight
    })

    return totalWeight > 0 ? totalWeightedScore / totalWeight : 0
  } catch (error) {
    console.error("Error calculating weighted average:", error)
    // Fallback to simple average
    const sum = grades.reduce((acc, g) => acc + g.score, 0)
    return sum / grades.length
  }
}

/**
 * Batch update grade weights
 */
export async function batchUpdateGradeWeights(
  lembagaId: string,
  updates: Array<{
    id?: string
    examType: string
    weight: number
    order: number
    isActive: boolean
  }>
) {
  try {
    const updatePromises = updates.map(update => {
      if (update.id) {
        // Update existing
        return prisma.gradeWeight.update({
          where: { id: update.id },
          data: {
            weight: update.weight,
            order: update.order,
            isActive: update.isActive
          }
        })
      } else {
        // Create new
        return prisma.gradeWeight.create({
          data: {
            lembagaId,
            examType: update.examType,
            weight: update.weight,
            order: update.order,
            isActive: update.isActive
          }
        })
      }
    })

    await Promise.all(updatePromises)
    revalidatePath('/dashboard')

    return { success: true, message: "Weights updated successfully" }
  } catch (error) {
    console.error("Error batch updating weights:", error)
    throw new Error("Failed to update weights")
  }
}


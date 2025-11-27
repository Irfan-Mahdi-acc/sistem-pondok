'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// Get data for non-exam grade input
export async function getNonExamGradeInputData(mapelId: string, category: string) {
  const mapel = await prisma.mapel.findUnique({
    where: { id: mapelId },
    include: {
      kelas: {
        include: {
          santris: {
            where: { status: 'ACTIVE' },
            orderBy: { nama: 'asc' }
          }
        }
      }
    }
  })

  if (!mapel) {
    throw new Error('Mapel not found')
  }

  // Get existing grades for this category
  const existingGrades = await prisma.nilai.findMany({
    where: {
      mapelId: mapelId,
      category: category,
    }
  })

  const gradeMap = new Map(existingGrades.map(g => [g.santriId, g]))

  const santriList = mapel.kelas?.santris.map(santri => ({
    id: santri.id,
    nis: santri.nis,
    nama: santri.nama,
    letterGrade: gradeMap.get(santri.id)?.letterGrade || null,
  })) || []

  return {
    mapel: {
      id: mapel.id,
      name: mapel.name,
      code: mapel.code,
    },
    santriList
  }
}

// Save non-exam grade
export async function saveNonExamGrade(
  mapelId: string,
  santriId: string,
  category: string,
  letterGrade: string
) {
  try {
    // Check if grade already exists
    const existing = await prisma.nilai.findFirst({
      where: {
        santriId,
        mapelId,
        category
      }
    })

    if (existing) {
      await prisma.nilai.update({
        where: { id: existing.id },
        data: { letterGrade }
      })
    } else {
      await prisma.nilai.create({
        data: {
          santriId,
          mapelId,
          category,
          letterGrade,
          gradeType: 'LETTER',
        }
      })
    }

    revalidatePath(`/dashboard/academic/mapel/${mapelId}/grades`)
    return { success: true }
  } catch (error) {
    console.error('Save non-exam grade error:', error)
    return { success: false, error: 'Failed to save grade' }
  }
}

// Bulk save non-exam grades
export async function bulkSaveNonExamGrades(
  mapelId: string,
  category: string,
  grades: { santriId: string; letterGrade: string }[]
) {
  try {
    for (const grade of grades) {
      const existing = await prisma.nilai.findFirst({
        where: {
          santriId: grade.santriId,
          mapelId,
          category
        }
      })

      if (existing) {
        await prisma.nilai.update({
          where: { id: existing.id },
          data: { letterGrade: grade.letterGrade }
        })
      } else {
        await prisma.nilai.create({
          data: {
            santriId: grade.santriId,
            mapelId,
            category,
            letterGrade: grade.letterGrade,
            gradeType: 'LETTER',
          }
        })
      }
    }

    revalidatePath(`/dashboard/academic/mapel/${mapelId}/grades`)
    return { success: true }
  } catch (error) {
    console.error('Bulk save non-exam grades error:', error)
    return { success: false, error: 'Failed to save grades' }
  }
}


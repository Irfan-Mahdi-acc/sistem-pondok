'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Academic Year Actions
const AcademicYearSchema = z.object({
  name: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
  lembagaId: z.string().optional().or(z.literal('')),
})

export async function getAcademicYears(lembagaId?: string) {
  return await prisma.academicYear.findMany({
    where: lembagaId ? { lembagaId } : {},
    include: {
      lembaga: true
    },
    orderBy: { startDate: 'desc' }
  })
}

export async function getActiveAcademicYear(lembagaId?: string) {
  return await prisma.academicYear.findFirst({
    where: {
      isActive: true,
      ...(lembagaId && { lembagaId })
    }
  })
}

export async function createAcademicYear(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries())
  const validatedData = AcademicYearSchema.safeParse(rawData)

  if (!validatedData.success) {
    return { success: false, error: validatedData.error.flatten() }
  }

  try {
    const data = validatedData.data
    await prisma.academicYear.create({
      data: {
        name: data.name,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        lembagaId: data.lembagaId || null,
        isActive: false,
      }
    })

    revalidatePath('/dashboard/academic/settings')
    revalidatePath('/dashboard/academic/nilai-raport')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Failed to create academic year' }
  }
}

export async function setActiveAcademicYear(id: string, lembagaId?: string) {
  try {
    // Deactivate all academic years for this lembaga
    await prisma.academicYear.updateMany({
      where: lembagaId ? { lembagaId } : {},
      data: { isActive: false }
    })

    // Activate the selected one
    await prisma.academicYear.update({
      where: { id },
      data: { isActive: true }
    })

    revalidatePath('/dashboard/academic/settings')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to set active academic year' }
  }
}

export async function setInactiveAcademicYear(id: string) {
  try {
    await prisma.academicYear.update({
      where: { id },
      data: { isActive: false }
    })

    revalidatePath('/dashboard/academic/calendar')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to deactivate academic year' }
  }
}

export async function deleteAcademicYear(id: string) {
  try {
    await prisma.academicYear.delete({
      where: { id },
    })
    revalidatePath('/dashboard/academic/settings')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete academic year' }
  }
}

// Get current semester based on date
export async function getCurrentSemester(academicYearId: string): Promise<"1" | "2" | null> {
  try {
    const academicYear = await prisma.academicYear.findUnique({
      where: { id: academicYearId }
    })
    
    if (!academicYear) return null
    
    const now = new Date()
    const start = new Date(academicYear.startDate)
    const end = new Date(academicYear.endDate)
    
    // Calculate midpoint
    const midpoint = new Date((start.getTime() + end.getTime()) / 2)
    
    // If before midpoint, semester 1, otherwise semester 2
    return now < midpoint ? "1" : "2"
  } catch (error) {
    console.error("Error determining current semester:", error)
    return null
  }
}

// Get academic years by lembaga (includes both lembaga-specific and global)
export async function getAcademicYearsByLembaga(lembagaId: string) {
  return await prisma.academicYear.findMany({
    where: {
      OR: [
        { lembagaId: lembagaId },
        { lembagaId: null } // Include global academic years
      ]
    },
    include: {
      lembaga: true
    },
    orderBy: { startDate: 'desc' }
  })
}

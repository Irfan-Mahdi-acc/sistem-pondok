'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// --- Violation Categories ---

export async function getViolationCategories() {
  try {
    const categories = await prisma.violationCategory.findMany({
      orderBy: { points: 'desc' }
    })
    return categories
  } catch (error) {
    console.error("Error fetching violation categories:", error)
    return []
  }
}

export async function createViolationCategory(data: {
  name: string
  type: string
  points: number
  description?: string
}) {
  try {
    const category = await prisma.violationCategory.create({
      data
    })
    revalidatePath('/dashboard/settings')
    return { success: true, data: category }
  } catch (error) {
    console.error("Error creating violation category:", error)
    return { success: false, error: "Gagal membuat kategori pelanggaran" }
  }
}

export async function updateViolationCategory(id: string, data: {
  name: string
  type: string
  points: number
  description?: string
}) {
  try {
    const category = await prisma.violationCategory.update({
      where: { id },
      data
    })
    revalidatePath('/dashboard/settings')
    return { success: true, data: category }
  } catch (error) {
    console.error("Error updating violation category:", error)
    return { success: false, error: "Gagal update kategori pelanggaran" }
  }
}

export async function deleteViolationCategory(id: string) {
  try {
    await prisma.violationCategory.delete({
      where: { id }
    })
    revalidatePath('/dashboard/settings')
    return { success: true }
  } catch (error) {
    console.error("Error deleting violation category:", error)
    return { success: false, error: "Gagal menghapus kategori pelanggaran" }
  }
}

// --- Violation Records ---

export async function getViolationRecords(santriId?: string) {
  try {
    const where = santriId ? { santriId } : {}
    const records = await prisma.violationRecord.findMany({
      where,
      include: {
        santri: true,
        category: true
      },
      orderBy: { date: 'desc' }
    })
    return records
  } catch (error) {
    console.error("Error fetching violation records:", error)
    return []
  }
}

export async function createViolationRecord(data: {
  santriId: string
  categoryId: string
  date: Date
  description?: string
  sanction?: string
  reportedBy?: string
}) {
  try {
    const record = await prisma.violationRecord.create({
      data: {
        ...data,
        status: 'PENDING' // Default status
      }
    })
    revalidatePath('/dashboard/aktivitas')
    revalidatePath(`/dashboard/santri/${data.santriId}`)
    return { success: true, data: record }
  } catch (error) {
    console.error("Error creating violation record:", error)
    return { success: false, error: "Gagal mencatat pelanggaran" }
  }
}

export async function updateViolationRecord(id: string, data: {
  categoryId?: string
  date?: Date
  description?: string
  sanction?: string
  status?: string
}) {
  try {
    const record = await prisma.violationRecord.update({
      where: { id },
      data
    })
    revalidatePath('/dashboard/aktivitas')
    return { success: true, data: record }
  } catch (error) {
    console.error("Error updating violation record:", error)
    return { success: false, error: "Gagal update catatan pelanggaran" }
  }
}

export async function deleteViolationRecord(id: string) {
  try {
    await prisma.violationRecord.delete({
      where: { id }
    })
    revalidatePath('/dashboard/aktivitas')
    return { success: true }
  } catch (error) {
    console.error("Error deleting violation record:", error)
    return { success: false, error: "Gagal menghapus catatan pelanggaran" }
  }
}

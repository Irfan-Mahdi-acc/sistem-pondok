"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Validation Schema
const CategorySchema = z.object({
  name: z.string().min(1, "Nama kategori harus diisi"),
  groupName: z.string().optional().nullable(),
  gradeType: z.enum(["NUMERIC", "LETTER"]),
  lembagaId: z.string().min(1, "Lembaga harus dipilih"),
})

// Get all categories for a lembaga, grouped by groupName
export async function getLembagaCategories(lembagaId: string) {
  try {
    const categories = await prisma.lembagaGradeCategory.findMany({
      where: { lembagaId },
      orderBy: [
        { groupName: 'asc' },
        { order: 'asc' },
        { name: 'asc' }
      ],
      include: {
        _count: {
          select: { nilais: true }
        }
      }
    })

    // Group categories by groupName
    const grouped: Record<string, typeof categories> = {}
    
    categories.forEach(cat => {
      const group = cat.groupName || 'Ungrouped'
      if (!grouped[group]) {
        grouped[group] = []
      }
      grouped[group].push(cat)
    })

    return { categories, grouped }
  } catch (error) {
    console.error("Error fetching lembaga categories:", error)
    throw new Error("Failed to fetch categories")
  }
}

// Get category by ID
export async function getLembagaCategoryById(id: string) {
  try {
    return await prisma.lembagaGradeCategory.findUnique({
      where: { id }
    })
  } catch (error) {
    console.error("Error fetching category by ID:", error)
    return null
  }
}


// Create new category
export async function createLembagaCategory(data: {
  name: string
  groupName?: string | null
  gradeType: "NUMERIC" | "LETTER"
  lembagaId: string
}) {
  const validatedData = CategorySchema.safeParse(data)

  if (!validatedData.success) {
    return { 
      success: false, 
      error: validatedData.error.flatten().fieldErrors 
    }
  }

  try {
    // Check for duplicate name in same lembaga
    const existing = await prisma.lembagaGradeCategory.findUnique({
      where: {
        lembagaId_name: {
          lembagaId: validatedData.data.lembagaId,
          name: validatedData.data.name
        }
      }
    })

    if (existing) {
      return {
        success: false,
        error: "Kategori dengan nama ini sudah ada"
      }
    }

    // Get max order for this lembaga
    const maxOrder = await prisma.lembagaGradeCategory.aggregate({
      where: { lembagaId: validatedData.data.lembagaId },
      _max: { order: true }
    })

    const category = await prisma.lembagaGradeCategory.create({
      data: {
        name: validatedData.data.name,
        groupName: validatedData.data.groupName || null,
        gradeType: validatedData.data.gradeType,
        lembagaId: validatedData.data.lembagaId,
        order: (maxOrder._max.order || 0) + 1
      }
    })

    revalidatePath('/dashboard/lembaga')
    return { success: true, category }
  } catch (error) {
    console.error("Error creating category:", error)
    return { 
      success: false, 
      error: "Gagal membuat kategori" 
    }
  }
}

// Update category
export async function updateLembagaCategory(
  id: string,
  data: {
    name?: string
    groupName?: string | null
    gradeType?: "NUMERIC" | "LETTER"
  }
) {
  try {
    const category = await prisma.lembagaGradeCategory.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.groupName !== undefined && { groupName: data.groupName || null }),
        ...(data.gradeType && { gradeType: data.gradeType })
      }
    })

    revalidatePath('/dashboard/lembaga')
    return { success: true, category }
  } catch (error) {
    console.error("Error updating category:", error)
    return { 
      success: false, 
      error: "Gagal mengupdate kategori" 
    }
  }
}

// Delete category (will cascade delete all associated grades)
export async function deleteLembagaCategory(id: string) {
  try {
    await prisma.lembagaGradeCategory.delete({
      where: { id }
    })

    revalidatePath('/dashboard/lembaga')
    return { success: true }
  } catch (error) {
    console.error("Error deleting category:", error)
    return { 
      success: false, 
      error: "Gagal menghapus kategori" 
    }
  }
}

// Reorder categories
export async function reorderCategories(
  lembagaId: string,
  orders: { id: string; order: number }[]
) {
  try {
    await prisma.$transaction(
      orders.map(({ id, order }) =>
        prisma.lembagaGradeCategory.update({
          where: { id },
          data: { order }
        })
      )
    )

    revalidatePath('/dashboard/lembaga')
    return { success: true }
  } catch (error) {
    console.error("Error reordering categories:", error)
    return { 
      success: false, 
      error: "Gagal mengubah urutan kategori" 
    }
  }
}

// Get unique group names for a lembaga
export async function getLembagaGroupNames(lembagaId: string) {
  try {
    const categories = await prisma.lembagaGradeCategory.findMany({
      where: { lembagaId },
      select: { groupName: true },
      distinct: ['groupName']
    })

    return categories
      .map(c => c.groupName)
      .filter((name): name is string => name !== null)
      .sort()
  } catch (error) {
    console.error("Error fetching group names:", error)
    return []
  }
}

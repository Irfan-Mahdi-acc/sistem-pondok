"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Validation Schema
const MapelGroupSchema = z.object({
  name: z.string().min(1, "Nama group harus diisi"),
  lembagaId: z.string().min(1, "Lembaga harus dipilih"),
})

// Get all mapel groups, optionally filtered by lembagaId
export async function getMapelGroups(lembagaId?: string) {
  try {
    const groups = await prisma.mapelGroup.findMany({
      where: lembagaId ? { lembagaId } : undefined,
      orderBy: [
        { lembaga: { name: 'asc' } },
        { order: 'asc' },
        { name: 'asc' }
      ],
      include: {
        lembaga: true,
        _count: {
          select: { mapels: true }
        }
      }
    })

    // Group by lembagaId
    const grouped: Record<string, typeof groups> = {}
    
    groups.forEach(group => {
      const lembagaName = group.lembaga.name
      if (!grouped[lembagaName]) {
        grouped[lembagaName] = []
      }
      grouped[lembagaName].push(group)
    })

    return { groups, grouped }
  } catch (error) {
    console.error("Error fetching mapel groups:", error)
    throw new Error("Failed to fetch mapel groups")
  }
}

// Create new mapel group
export async function createMapelGroup(data: {
  name: string
  lembagaId: string
}) {
  const validatedData = MapelGroupSchema.safeParse(data)

  if (!validatedData.success) {
    return { 
      success: false, 
      error: validatedData.error.flatten().fieldErrors 
    }
  }

  try {
    // Check for duplicate name in same lembaga
    const existing = await prisma.mapelGroup.findUnique({
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
        error: "Group dengan nama ini sudah ada di lembaga yang sama"
      }
    }

    // Get max order for this lembaga
    const maxOrder = await prisma.mapelGroup.aggregate({
      where: { lembagaId: validatedData.data.lembagaId },
      _max: { order: true }
    })

    const group = await prisma.mapelGroup.create({
      data: {
        name: validatedData.data.name,
        lembagaId: validatedData.data.lembagaId,
        order: (maxOrder._max.order || 0) + 1
      }
    })

    revalidatePath('/dashboard/academic/mapel')
    return { success: true, group }
  } catch (error) {
    console.error("Error creating mapel group:", error)
    return { 
      success: false, 
      error: "Gagal membuat group" 
    }
  }
}

// Update mapel group
export async function updateMapelGroup(
  id: string,
  data: {
    name?: string
    lembagaId?: string
  }
) {
  try {
    const group = await prisma.mapelGroup.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.lembagaId && { lembagaId: data.lembagaId })
      }
    })

    revalidatePath('/dashboard/academic/mapel')
    return { success: true, group }
  } catch (error) {
    console.error("Error updating mapel group:", error)
    return { 
      success: false, 
      error: "Gagal mengupdate group" 
    }
  }
}

// Delete mapel group (mapels will remain, just ungrouped)
export async function deleteMapelGroup(id: string) {
  try {
    await prisma.mapelGroup.delete({
      where: { id }
    })

    revalidatePath('/dashboard/academic/mapel')
    return { success: true }
  } catch (error) {
    console.error("Error deleting mapel group:", error)
    return { 
      success: false, 
      error: "Gagal menghapus group" 
    }
  }
}

// Reorder groups within a lembaga
export async function reorderMapelGroups(
  lembagaId: string,
  orders: { id: string; order: number }[]
) {
  try {
    await prisma.$transaction(
      orders.map(({ id, order }) =>
        prisma.mapelGroup.update({
          where: { id },
          data: { order }
        })
      )
    )

    revalidatePath('/dashboard/academic/mapel')
    return { success: true }
  } catch (error) {
    console.error("Error reordering mapel groups:", error)
    return { 
      success: false, 
      error: "Gagal mengubah urutan group" 
    }
  }
}

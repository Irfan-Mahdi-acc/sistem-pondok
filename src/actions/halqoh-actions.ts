'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const HalqohSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  ustadzId: z.string().optional().or(z.literal('')),
  schedule: z.string().optional(),
  level: z.string().optional(),
  maxCapacity: z.coerce.number().optional(),
  status: z.string().default('ACTIVE'),
})

export async function getHalqohList() {
  return await prisma.halqoh.findMany({
    include: {
      ustadz: {
        include: {
          user: true
        }
      },
      santris: true,
      _count: {
        select: {
          santris: true
        }
      }
    },
    orderBy: { name: 'asc' }
  })
}

export async function getHalqohById(id: string) {
  return await prisma.halqoh.findUnique({
    where: { id },
    include: {
      ustadz: {
        include: {
          user: true
        }
      },
      santris: {
        include: {
          kelas: true,
          lembaga: true
        }
      }
    }
  })
}

export async function createHalqoh(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries())
  const validatedData = HalqohSchema.safeParse(rawData)

  if (!validatedData.success) {
    return { success: false, error: validatedData.error.flatten() }
  }

  try {
    const data = validatedData.data
    await prisma.halqoh.create({
      data: {
        name: data.name,
        description: data.description || null,
        ustadzId: data.ustadzId || null,
        schedule: data.schedule || null,
        level: data.level || null,
        maxCapacity: data.maxCapacity || null,
        status: data.status,
      }
    })

    revalidatePath('/dashboard/academic/halqoh')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Failed to create halqoh' }
  }
}

export async function updateHalqoh(id: string, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries())
  const validatedData = HalqohSchema.safeParse(rawData)

  if (!validatedData.success) {
    return { success: false, error: validatedData.error.flatten() }
  }

  try {
    const data = validatedData.data
    await prisma.halqoh.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description || null,
        ustadzId: data.ustadzId || null,
        schedule: data.schedule || null,
        level: data.level || null,
        maxCapacity: data.maxCapacity || null,
        status: data.status,
      }
    })

    revalidatePath('/dashboard/academic/halqoh')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to update halqoh' }
  }
}

export async function deleteHalqoh(id: string) {
  try {
    await prisma.halqoh.delete({
      where: { id },
    })
    revalidatePath('/dashboard/academic/halqoh')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete halqoh' }
  }
}

export async function addSantriToHalqoh(halqohId: string, santriId: string) {
  try {
    // Check capacity
    const halqoh = await prisma.halqoh.findUnique({
      where: { id: halqohId },
      include: {
        _count: {
          select: { santris: true }
        }
      }
    })

    if (!halqoh) {
      return { success: false, error: 'Halqoh tidak ditemukan' }
    }

    if (halqoh.maxCapacity && halqoh._count.santris >= halqoh.maxCapacity) {
      return { success: false, error: 'Halqoh sudah penuh' }
    }

    // Check if santri already in another halqoh
    const santri = await prisma.santri.findUnique({
      where: { id: santriId }
    })

    if (santri?.halqohId) {
      return { success: false, error: 'Santri sudah terdaftar di halqoh lain' }
    }

    // Add santri to halqoh (one-to-many)
    await prisma.santri.update({
      where: { id: santriId },
      data: { halqohId }
    })

    revalidatePath('/dashboard/academic/halqoh')
    revalidatePath(`/dashboard/academic/halqoh/${halqohId}`)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: 'Gagal menambahkan santri' }
  }
}

export async function removeSantriFromHalqoh(halqohId: string, santriId: string) {
  try {
    await prisma.santri.update({
      where: { id: santriId },
      data: { halqohId: null }
    })

    revalidatePath('/dashboard/academic/halqoh')
    revalidatePath(`/dashboard/academic/halqoh/${halqohId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Gagal mengeluarkan santri' }
  }
}

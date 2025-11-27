'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const MapelSchema = z.object({
  name: z.string().min(1, "Nama mata pelajaran harus diisi"),
  code: z.string().optional().nullable(),
  kelasId: z.string().min(1, "Kelas harus dipilih"),
  ustadzId: z.string().optional().nullable().transform(val => val || null),
  groupId: z.string().optional().nullable().transform(val => val || null),
})

// Get all mapels across all institutions for global view
export async function getAllMapelsGlobal() {
  return await prisma.mapel.findMany({
    include: {
      kelas: {
        include: {
          lembaga: true
        }
      },
      ustadz: {
        include: {
          user: true
        }
      },
      group: true, // Include group
      jadwals: true // Include schedules for count
    },
    orderBy: { name: 'asc' }
  })
}

export async function getMapelsByLembaga(lembagaId: string) {
  return await prisma.mapel.findMany({
    where: {
      kelas: {
        lembagaId: lembagaId
      }
    },
    include: {
      kelas: true,
      ustadz: {
        include: {
          user: true
        }
      }
    },
    orderBy: { name: 'asc' }
  })
}

export async function createMapel(formData: FormData) {
  const rawData = {
    name: formData.get('name'),
    code: formData.get('code'),
    kelasId: formData.get('kelasId'),
    ustadzId: formData.get('ustadzId'),
    groupId: formData.get('groupId'),
  }

  console.log('Creating mapel with data:', rawData)

  const validatedData = MapelSchema.safeParse(rawData)

  if (!validatedData.success) {
    console.error('Validation failed:', validatedData.error.flatten())
    return { success: false, error: validatedData.error.flatten() }
  }

  try {
    const newMapel = await prisma.mapel.create({
      data: {
        name: validatedData.data.name,
        code: validatedData.data.code || null,
        kelasId: validatedData.data.kelasId,
        ustadzId: validatedData.data.ustadzId || null,
        groupId: validatedData.data.groupId || null,
      },
    })
    console.log('Mapel created successfully:', newMapel.id)
    revalidatePath('/dashboard/academic/mapel')
    revalidatePath('/dashboard/lembaga')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to create mapel:', error)
    
    // Handle specific database errors
    if (error.code === 'P2002') {
      return { success: false, error: 'Mata pelajaran dengan nama atau kode ini sudah ada di kelas tersebut' }
    }
    if (error.code === 'P2003') {
      return { success: false, error: 'Kelas atau pengampu yang dipilih tidak valid' }
    }
    
    return { success: false, error: error.message || 'Gagal menambahkan mata pelajaran' }
  }
}

export async function updateMapel(id: string, formData: FormData) {
  const rawData = {
    name: formData.get('name'),
    code: formData.get('code'),
    kelasId: formData.get('kelasId'),
    ustadzId: formData.get('ustadzId'),
    groupId: formData.get('groupId'),
  }

  const validatedData = MapelSchema.safeParse(rawData)

  if (!validatedData.success) {
    return { success: false, error: validatedData.error.flatten() }
  }

  try {
    await prisma.mapel.update({
      where: { id },
      data: {
        name: validatedData.data.name,
        code: validatedData.data.code || null,
        kelasId: validatedData.data.kelasId,
        ustadzId: validatedData.data.ustadzId || null,
        groupId: validatedData.data.groupId || null,
      },
    })
    revalidatePath('/dashboard/lembaga')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to update mapel' }
  }
}

export async function deleteMapel(id: string) {
  try {
    await prisma.mapel.delete({
      where: { id },
    })
    revalidatePath('/dashboard/lembaga')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete mapel' }
  }
}

export async function getUstadzList() {
  return await prisma.ustadzProfile.findMany({
    include: {
      user: true
    }
  })
}

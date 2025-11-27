'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const KelasSchema = z.object({
  name: z.string().min(1),
  lembagaId: z.string().min(1),
  nextKelasId: z.string().optional().or(z.literal('')),
})

export async function getKelasList() {
  return await prisma.kelas.findMany({
    orderBy: { name: 'asc' },
    include: {
      lembaga: true,
      nextKelas: {
        include: {
          lembaga: true
        }
      },
      _count: {
        select: { santris: true }
      }
    }
  })
}

export async function getKelasByLembaga(lembagaId: string) {
  return await prisma.kelas.findMany({
    where: { lembagaId },
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { santris: true }
      }
    }
  })
}


export async function getKelasById(id: string) {
  return await prisma.kelas.findUnique({
    where: { id },
    include: {
      lembaga: true,
      santris: {
        orderBy: { nama: 'asc' }
      },
      ketuaKelas: true,
      waliKelas: {
        include: {
          user: true
        }
      },
      nextKelas: true,
      _count: {
        select: { santris: true }
      }
    }
  })
}

// Get kelas with mapel for exam management
export async function getKelasByIdWithMapel(id: string) {
  return await prisma.kelas.findUnique({
    where: { id },
    include: {
      lembaga: true,
      mapels: {
        orderBy: { name: 'asc' }
      },
      _count: {
        select: { santris: true }
      }
    }
  })
}

// Get kelas with santri for nilai input
export async function getKelasByIdWithSantri(id: string) {
  return await prisma.kelas.findUnique({
    where: { id },
    include: {
      lembaga: true,
      santris: {
        where: { status: 'ACTIVE' },
        orderBy: { nama: 'asc' },
        select: {
          id: true,
          nis: true,
          nama: true,
          status: true
        }
      }
    }
  })
}


export async function createKelas(formData: FormData) {
  try {
    const name = formData.get('name') as string
    const lembagaId = formData.get('lembagaId') as string
    const nextKelasId = formData.get('nextKelasId') as string | null

    console.log('Creating kelas with:', { name, lembagaId, nextKelasId })

    const validatedFields = KelasSchema.safeParse({
      name,
      lembagaId,
      nextKelasId: nextKelasId || undefined,
    })

    if (!validatedFields.success) {
      console.error('Validation failed:', validatedFields.error.flatten().fieldErrors)
      return { error: 'Invalid fields' }
    }

    const data: any = {
      name: validatedFields.data.name,
      lembagaId: validatedFields.data.lembagaId,
      level: '1', // Default level
    }

    if (validatedFields.data.nextKelasId) {
      data.nextKelasId = validatedFields.data.nextKelasId
    }

    const kelas = await prisma.kelas.create({
      data,
    })

    revalidatePath('/dashboard/lembaga')
    return { success: true, kelas }
  } catch (error) {
    console.error('Error creating kelas:', error)
    return { error: 'Failed to create kelas' }
  }
}

export async function updateKelas(id: string, formData: FormData) {
  try {
    const name = formData.get('name') as string
    const nextKelasId = formData.get('nextKelasId') as string | null

    const validatedFields = KelasSchema.omit({ lembagaId: true }).safeParse({
      name,
      nextKelasId: nextKelasId || undefined,
    })

    if (!validatedFields.success) {
      return { error: 'Invalid fields' }
    }

    const data: any = {
      name: validatedFields.data.name,
    }

    if (validatedFields.data.nextKelasId) {
      data.nextKelasId = validatedFields.data.nextKelasId
    } else {
      data.nextKelasId = null
    }

    await prisma.kelas.update({
      where: { id },
      data,
    })

    revalidatePath('/dashboard/lembaga')
    return { success: true }
  } catch (error) {
    console.error('Error updating kelas:', error)
    return { error: 'Failed to update kelas' }
  }
}

export async function deleteKelas(id: string) {
  try {
    await prisma.kelas.delete({
      where: { id },
    })

    revalidatePath('/dashboard/lembaga')
    return { success: true }
  } catch (error) {
    console.error('Error deleting kelas:', error)
    return { error: 'Failed to delete kelas' }
  }
}

export async function updateKetuaKelas(kelasId: string, santriId: string | null) {
  try {
    await prisma.kelas.update({
      where: { id: kelasId },
      data: {
        ketuaKelasId: santriId,
      },
    })

    revalidatePath(`/dashboard/lembaga`)
    return { success: true }
  } catch (error) {
    console.error('Error updating ketua kelas:', error)
    return { error: 'Failed to update ketua kelas' }
  }
}

export async function updateWaliKelas(kelasId: string, ustadzId: string | null) {
  try {
    await prisma.kelas.update({
      where: { id: kelasId },
      data: {
        waliKelasId: ustadzId,
      },
    })

    revalidatePath(`/dashboard/lembaga`)
    return { success: true }
  } catch (error) {
    console.error('Error updating wali kelas:', error)
    return { error: 'Failed to update wali kelas' }
  }
}

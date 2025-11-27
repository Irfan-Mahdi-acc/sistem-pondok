'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const JamPelajaranSchema = z.object({
  name: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  lembagaId: z.string().min(1),
})

const JadwalSchema = z.object({
  day: z.string().min(1),
  kelasId: z.string().min(1),
  mapelId: z.string().optional().or(z.literal('')),
  jamPelajaranId: z.string().min(1),
})

export async function getJamPelajaranByLembaga(lembagaId: string) {
  return await prisma.jamPelajaran.findMany({
    where: { lembagaId },
    orderBy: { startTime: 'asc' }
  })
}

export async function createJamPelajaran(formData: FormData) {
  const rawData = {
    name: formData.get('name'),
    startTime: formData.get('startTime'),
    endTime: formData.get('endTime'),
    lembagaId: formData.get('lembagaId'),
  }

  const validatedData = JamPelajaranSchema.safeParse(rawData)

  if (!validatedData.success) {
    return { success: false, error: validatedData.error.flatten() }
  }

  try {
    // Get all existing jam pelajaran for this lembaga
    const existingJams = await prisma.jamPelajaran.findMany({
      where: { lembagaId: validatedData.data.lembagaId },
      select: { id: true, startTime: true }
    })

    // Add the new jam to the list and sort by startTime
    const allJams = [
      ...existingJams,
      { id: 'new', startTime: validatedData.data.startTime }
    ].sort((a, b) => a.startTime.localeCompare(b.startTime))

    // Find the order for the new jam
    const newOrder = allJams.findIndex(j => j.id === 'new') + 1

    // Create the new jam pelajaran with calculated order
    await prisma.jamPelajaran.create({
      data: {
        ...validatedData.data,
        order: newOrder,
      },
    })

    // Update orders for all existing jams that come after the new one
    for (let i = 0; i < allJams.length; i++) {
      const jam = allJams[i]
      if (jam.id !== 'new') {
        await prisma.jamPelajaran.update({
          where: { id: jam.id },
          data: { order: i + 1 }
        })
      }
    }

    revalidatePath('/dashboard/lembaga')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to create jam pelajaran' }
  }
}

export async function updateJamPelajaran(id: string, formData: FormData) {
  const rawData = {
    name: formData.get('name'),
    startTime: formData.get('startTime'),
    endTime: formData.get('endTime'),
    lembagaId: formData.get('lembagaId'),
  }

  const validatedData = JamPelajaranSchema.safeParse(rawData)

  if (!validatedData.success) {
    return { success: false, error: validatedData.error.flatten() }
  }

  try {
    // Update the jam pelajaran
    await prisma.jamPelajaran.update({
      where: { id },
      data: validatedData.data,
    })

    // Recalculate order for all jam pelajaran in this lembaga
    const allJams = await prisma.jamPelajaran.findMany({
      where: { lembagaId: validatedData.data.lembagaId },
      select: { id: true, startTime: true },
      orderBy: { startTime: 'asc' }
    })

    // Update order for each jam based on sorted position
    for (let i = 0; i < allJams.length; i++) {
      await prisma.jamPelajaran.update({
        where: { id: allJams[i].id },
        data: { order: i + 1 }
      })
    }

    revalidatePath('/dashboard/lembaga')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to update jam pelajaran' }
  }
}

export async function deleteJamPelajaran(id: string) {
  try {
    await prisma.jamPelajaran.delete({
      where: { id },
    })
    revalidatePath('/dashboard/lembaga')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete jam pelajaran' }
  }
}

export async function getJadwalByLembaga(lembagaId: string) {
  return await prisma.jadwalPelajaran.findMany({
    where: {
      kelas: {
        lembagaId: lembagaId
      }
    },
    include: {
      kelas: true,
      mapel: {
        include: {
          ustadz: {
            include: {
              user: true
            }
          }
        }
      },
      jamPelajaran: true,
    },
    orderBy: [
      { day: 'asc' },
      { jamPelajaran: { order: 'asc' } }
    ]
  })
}

export async function getJadwalByMapel(mapelId: string) {
  return await prisma.jadwalPelajaran.findMany({
    where: {
      mapelId: mapelId
    },
    include: {
      kelas: true,
      jamPelajaran: true,
    },
    orderBy: [
      { day: 'asc' },
      { jamPelajaran: { order: 'asc' } }
    ]
  })
}

export async function createJadwal(formData: FormData) {
  const rawData = {
    day: formData.get('day'),
    kelasId: formData.get('kelasId'),
    mapelId: formData.get('mapelId'),
    jamPelajaranId: formData.get('jamPelajaranId'),
  }

  const validatedData = JadwalSchema.safeParse(rawData)

  if (!validatedData.success) {
    return { success: false, error: validatedData.error.flatten() }
  }

  try {
    await prisma.jadwalPelajaran.create({
      data: {
        day: validatedData.data.day,
        kelasId: validatedData.data.kelasId,
        mapelId: validatedData.data.mapelId || null,
        jamPelajaranId: validatedData.data.jamPelajaranId,
      },
    })
    revalidatePath('/dashboard/lembaga')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to create jadwal' }
  }
}

export async function updateJadwal(id: string, formData: FormData) {
  const rawData = {
    day: formData.get('day'),
    kelasId: formData.get('kelasId'),
    mapelId: formData.get('mapelId'),
    jamPelajaranId: formData.get('jamPelajaranId'),
  }

  const validatedData = JadwalSchema.safeParse(rawData)

  if (!validatedData.success) {
    return { success: false, error: validatedData.error.flatten() }
  }

  try {
    await prisma.jadwalPelajaran.update({
      where: { id },
      data: {
        day: validatedData.data.day,
        kelasId: validatedData.data.kelasId,
        mapelId: validatedData.data.mapelId || null,
        jamPelajaranId: validatedData.data.jamPelajaranId,
      },
    })
    revalidatePath('/dashboard/lembaga')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to update jadwal' }
  }
}

export async function deleteJadwal(id: string) {
  try {
    await prisma.jadwalPelajaran.delete({
      where: { id },
    })
    revalidatePath('/dashboard/lembaga')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete jadwal' }
  }
}

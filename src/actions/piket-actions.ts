'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getPiketAreas() {
  try {
    const areas = await prisma.piketArea.findMany({
      orderBy: { name: 'asc' }
    })
    return areas
  } catch (error) {
    console.error("Error fetching piket areas:", error)
    return []
  }
}

export async function createPiketArea(data: {
  name: string
  frequency: string
  description?: string
}) {
  try {
    const area = await prisma.piketArea.create({
      data
    })
    revalidatePath('/dashboard/aktivitas')
    return { success: true, data: area }
  } catch (error) {
    console.error("Error creating piket area:", error)
    return { success: false, error: "Gagal membuat area piket" }
  }
}

export async function deletePiketArea(id: string) {
  try {
    await prisma.piketArea.delete({
      where: { id }
    })
    revalidatePath('/dashboard/aktivitas')
    return { success: true }
  } catch (error) {
    console.error("Error deleting piket area:", error)
    return { success: false, error: "Gagal menghapus area piket" }
  }
}

export async function getPiketSchedules(type: "ASRAMA" | "KELAS" | "AREA", locationId?: string) {
  try {
    const where: any = { type }
    if (locationId) {
      if (type === "ASRAMA") where.asramaId = locationId
      if (type === "KELAS") where.kelasId = locationId
      if (type === "AREA") where.piketAreaId = locationId
    }

    const schedules = await prisma.piketSchedule.findMany({
      where,
      include: {
        santri: true,
        asrama: true,
        kelas: true,
        piketArea: true
      },
      orderBy: { day: 'asc' }
    })
    return schedules
  } catch (error) {
    console.error("Error fetching piket schedules:", error)
    return []
  }
}

export async function createPiketSchedule(data: {
  type: "ASRAMA" | "KELAS" | "AREA"
  locationId: string
  day: string
  santriId: string
  area?: string
  role?: string
}) {
  try {
    const createData: any = {
      type: data.type,
      day: data.day,
      santriId: data.santriId,
      area: data.area,
      role: data.role
    }

    if (data.type === "ASRAMA") createData.asramaId = data.locationId
    if (data.type === "KELAS") createData.kelasId = data.locationId
    if (data.type === "AREA") createData.piketAreaId = data.locationId

    const schedule = await prisma.piketSchedule.create({
      data: createData
    })
    revalidatePath('/dashboard/aktivitas')
    return { success: true, data: schedule }
  } catch (error) {
    console.error("Error creating piket schedule:", error)
    return { success: false, error: "Gagal membuat jadwal piket" }
  }
}

export async function deletePiketSchedule(id: string) {
  try {
    await prisma.piketSchedule.delete({
      where: { id }
    })
    revalidatePath('/dashboard/aktivitas')
    return { success: true }
  } catch (error) {
    console.error("Error deleting piket schedule:", error)
    return { success: false, error: "Gagal menghapus jadwal piket" }
  }
}

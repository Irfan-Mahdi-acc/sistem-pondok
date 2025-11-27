'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getAchievementRecords(santriId?: string) {
  try {
    const where = santriId ? { santriId } : {}
    const records = await prisma.achievementRecord.findMany({
      where,
      include: {
        santri: true
      },
      orderBy: { date: 'desc' }
    })
    return records
  } catch (error) {
    console.error("Error fetching achievement records:", error)
    return []
  }
}

export async function createAchievementRecord(data: {
  santriId: string
  title: string
  category: string
  level: string
  rank?: string
  date: Date
  description?: string
}) {
  try {
    const record = await prisma.achievementRecord.create({
      data
    })
    revalidatePath('/dashboard/aktivitas')
    revalidatePath(`/dashboard/santri/${data.santriId}`)
    return { success: true, data: record }
  } catch (error) {
    console.error("Error creating achievement record:", error)
    return { success: false, error: "Gagal mencatat prestasi" }
  }
}

export async function updateAchievementRecord(id: string, data: {
  title?: string
  category?: string
  level?: string
  rank?: string
  date?: Date
  description?: string
}) {
  try {
    const record = await prisma.achievementRecord.update({
      where: { id },
      data
    })
    revalidatePath('/dashboard/aktivitas')
    return { success: true, data: record }
  } catch (error) {
    console.error("Error updating achievement record:", error)
    return { success: false, error: "Gagal update prestasi" }
  }
}

export async function deleteAchievementRecord(id: string) {
  try {
    await prisma.achievementRecord.delete({
      where: { id }
    })
    revalidatePath('/dashboard/aktivitas')
    return { success: true }
  } catch (error) {
    console.error("Error deleting achievement record:", error)
    return { success: false, error: "Gagal menghapus prestasi" }
  }
}

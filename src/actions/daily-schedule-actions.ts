'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const DailyScheduleSchema = z.object({
  name: z.string().min(1, "Nama kegiatan harus diisi"),
  type: z.enum(["IBADAH", "BELAJAR", "MAKAN", "ISTIRAHAT", "KEGIATAN"]),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format waktu tidak valid (HH:MM)"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format waktu tidak valid (HH:MM)"),
  days: z.string(), // JSON string
  location: z.string().optional().nullable().transform(val => val || null),
  description: z.string().optional().nullable().transform(val => val || null),
  isActive: z.boolean().default(true),
  order: z.number().default(0),
})

export async function getDailySchedules() {
  try {
    return await prisma.dailySchedule.findMany({
      orderBy: [
        { order: 'asc' },
        { startTime: 'asc' }
      ]
    })
  } catch (error) {
    console.error("Error fetching daily schedules:", error)
    return []
  }
}

export async function createDailySchedule(formData: FormData) {
  const rawData = {
    name: formData.get('name'),
    type: formData.get('type'),
    startTime: formData.get('startTime'),
    endTime: formData.get('endTime'),
    days: formData.get('days'),
    location: formData.get('location'),
    description: formData.get('description'),
    isActive: formData.get('isActive') === 'true',
    order: parseInt(formData.get('order') as string || '0'),
  }

  console.log('Creating daily schedule with data:', rawData)

  const validatedData = DailyScheduleSchema.safeParse(rawData)

  if (!validatedData.success) {
    console.error('Validation failed:', validatedData.error.flatten())
    return { success: false, error: validatedData.error.flatten() }
  }

  try {
    const newSchedule = await prisma.dailySchedule.create({
      data: validatedData.data,
    })
    console.log('Daily schedule created successfully:', newSchedule.id)
    revalidatePath('/dashboard/aktivitas')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to create daily schedule:', error)
    return { success: false, error: error.message || 'Gagal menambahkan jadwal' }
  }
}

export async function updateDailySchedule(id: string, formData: FormData) {
  const rawData = {
    name: formData.get('name'),
    type: formData.get('type'),
    startTime: formData.get('startTime'),
    endTime: formData.get('endTime'),
    days: formData.get('days'),
    location: formData.get('location'),
    description: formData.get('description'),
    isActive: formData.get('isActive') === 'true',
    order: parseInt(formData.get('order') as string || '0'),
  }

  const validatedData = DailyScheduleSchema.safeParse(rawData)

  if (!validatedData.success) {
    return { success: false, error: validatedData.error.flatten() }
  }

  try {
    await prisma.dailySchedule.update({
      where: { id },
      data: validatedData.data,
    })
    revalidatePath('/dashboard/aktivitas')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to update daily schedule:', error)
    return { success: false, error: error.message || 'Gagal mengupdate jadwal' }
  }
}

export async function deleteDailySchedule(id: string) {
  try {
    await prisma.dailySchedule.delete({
      where: { id },
    })
    revalidatePath('/dashboard/aktivitas')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to delete daily schedule:', error)
    return { success: false, error: error.message || 'Gagal menghapus jadwal' }
  }
}

export async function toggleScheduleStatus(id: string) {
  try {
    const schedule = await prisma.dailySchedule.findUnique({
      where: { id },
    })

    if (!schedule) {
      return { success: false, error: 'Jadwal tidak ditemukan' }
    }

    await prisma.dailySchedule.update({
      where: { id },
      data: { isActive: !schedule.isActive },
    })

    revalidatePath('/dashboard/aktivitas')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to toggle schedule status:', error)
    return { success: false, error: error.message || 'Gagal mengubah status jadwal' }
  }
}

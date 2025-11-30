'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Schemas
const PSBPeriodSchema = z.object({
  name: z.string().min(1, "Nama gelombang wajib diisi"),
  description: z.string().optional(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  isActive: z.boolean().optional(),
  quota: z.coerce.number().optional(),
  registrationFee: z.coerce.number().min(0).default(0),
})

const PSBRegistrationSchema = z.object({
  name: z.string().min(1, "Nama lengkap wajib diisi"),
  nisn: z.string().optional(),
  gender: z.enum(['L', 'P']),
  birthPlace: z.string().min(1, "Tempat lahir wajib diisi"),
  birthDate: z.string().or(z.date()),
  address: z.string().min(1, "Alamat wajib diisi"),
  fatherName: z.string().min(1, "Nama ayah wajib diisi"),
  motherName: z.string().min(1, "Nama ibu wajib diisi"),
  phone: z.string().min(1, "Nomor HP wajib diisi"),
  schoolOrigin: z.string().optional(),
  schoolAddress: z.string().optional(),
  schoolNpsn: z.string().optional(),
  periodId: z.string().optional(),
  trackId: z.string().optional(),
})

// Period Actions
export async function getPSBPeriods() {
  try {
    return await prisma.pSBPeriod.findMany({
      orderBy: { startDate: 'desc' },
      include: {
        _count: {
          select: { registrations: true }
        }
      }
    })
  } catch (error) {
    console.error('Error fetching periods:', error)
    return []
  }
}

export async function getActivePSBPeriod() {
  try {
    return await prisma.pSBPeriod.findFirst({
      where: { isActive: true },
      orderBy: { startDate: 'desc' }
    })
  } catch (error) {
    console.error('Error fetching active period:', error)
    return null
  }
}

export async function createPSBPeriod(data: z.infer<typeof PSBPeriodSchema>) {
  try {
    const period = await prisma.pSBPeriod.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      }
    })
    revalidatePath('/dashboard/psb')
    return { success: true, data: period }
  } catch (error) {
    console.error('Failed to create period:', error)
    return { success: false, error: 'Gagal membuat gelombang pendaftaran' }
  }
}

export async function updatePSBPeriod(id: string, data: Partial<z.infer<typeof PSBPeriodSchema>>) {
  try {
    const updateData: any = { ...data }
    if (data.startDate) updateData.startDate = new Date(data.startDate)
    if (data.endDate) updateData.endDate = new Date(data.endDate)

    const period = await prisma.pSBPeriod.update({
      where: { id },
      data: updateData
    })
    revalidatePath('/dashboard/psb')
    return { success: true, data: period }
  } catch (error) {
    console.error('Failed to update period:', error)
    return { success: false, error: 'Gagal mengupdate gelombang pendaftaran' }
  }
}

export async function deletePSBPeriod(id: string) {
  try {
    await prisma.pSBPeriod.delete({ where: { id } })
    revalidatePath('/dashboard/psb')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete period:', error)
    return { success: false, error: 'Gagal menghapus gelombang pendaftaran' }
  }
}

// Registration Actions
export async function createPSBRegistration(data: z.infer<typeof PSBRegistrationSchema>) {
  try {
    // Generate Registration No (e.g., PSB-YYYY-XXXX)
    const year = new Date().getFullYear()
    const count = await prisma.pSBRegistration.count()
    const registrationNo = `PSB-${year}-${(count + 1).toString().padStart(4, '0')}`

    const registration = await prisma.pSBRegistration.create({
      data: {
        ...data,
        registrationNo,
        birthDate: new Date(data.birthDate),
        status: 'PENDING',
        paymentStatus: 'UNPAID'
      }
    })
    return { success: true, data: registration }
  } catch (error) {
    console.error('Failed to create registration:', error)
    return { success: false, error: 'Gagal melakukan pendaftaran' }
  }
}

export async function getPSBRegistrations(filters?: { periodId?: string, status?: string }) {
  try {
    const where: any = {}
    if (filters?.periodId && filters.periodId !== 'all') where.periodId = filters.periodId
    if (filters?.status && filters.status !== 'all') where.status = filters.status

    return await prisma.pSBRegistration.findMany({
      where,
      include: {
        period: true,
        track: true
      },
      orderBy: { createdAt: 'desc' }
    })
  } catch (error) {
    console.error('Error fetching registrations:', error)
    return []
  }
}

export async function updatePSBRegistrationStatus(id: string, status: string) {
  try {
    const registration = await prisma.pSBRegistration.update({
      where: { id },
      data: { status }
    })
    revalidatePath('/dashboard/psb')
    return { success: true, data: registration }
  } catch (error) {
    console.error('Failed to update status:', error)
    return { success: false, error: 'Gagal mengupdate status pendaftaran' }
  }
}

export async function getPSBRegistrationById(id: string) {
  try {
    return await prisma.pSBRegistration.findUnique({
      where: { id },
      include: {
        period: true,
        track: true
      }
    })
  } catch (error) {
    console.error('Error fetching registration:', error)
    return null
  }
}

export async function getPSBRegistrationByNo(registrationNo: string) {
  try {
    return await prisma.pSBRegistration.findUnique({
      where: { registrationNo },
      include: {
        period: true,
        track: true
      }
    })
  } catch (error) {
    console.error('Error fetching registration:', error)
    return null
  }
}

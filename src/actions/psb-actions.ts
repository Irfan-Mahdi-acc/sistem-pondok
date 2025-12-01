'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { calculateTotalFee } from "@/lib/psb-helpers"

// Schemas
const PSBPeriodSchema = z.object({
  name: z.string().min(1, "Nama gelombang wajib diisi"),
  description: z.string().optional(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  isActive: z.boolean().optional(),
  quota: z.number().optional(),
  lembagaId: z.string().min(1, "Lembaga wajib dipilih"),
  registrationFeeDetails: z.record(z.string(), z.number()).optional(),
  reregistrationFeeDetails: z.record(z.string(), z.number()).optional(),
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
  paymentProof: z.string().optional(),
})

// Period Actions
export async function getPSBPeriods(lembagaId?: string) {
  try {
    const where: any = {}
    if (lembagaId) where.lembagaId = lembagaId

    return await prisma.pSBPeriod.findMany({
      where,
      include: {
        lembaga: true,
        _count: {
          select: { registrations: true }
        }
      },
      orderBy: { startDate: 'desc' },
    })
  } catch (error) {
    console.error('Error fetching periods:', error)
    return []
  }
}

export async function getActivePSBPeriod(lembagaId?: string) {
  try {
    const where: any = { isActive: true }
    if (lembagaId) where.lembagaId = lembagaId

    return await prisma.pSBPeriod.findFirst({
      where,
      include: { lembaga: true },
      orderBy: { startDate: 'desc' }
    })
  } catch (error) {
    console.error('Error fetching active period:', error)
    return null
  }
}

export async function createPSBPeriod(data: z.infer<typeof PSBPeriodSchema>) {
  try {
    const registrationFee = calculateTotalFee(data.registrationFeeDetails as any)
    const reregistrationFee = calculateTotalFee(data.reregistrationFeeDetails as any)

    const period = await prisma.pSBPeriod.create({
      data: {
        name: data.name,
        description: data.description,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isActive: data.isActive ?? false,
        quota: data.quota,
        lembagaId: data.lembagaId,
        registrationFeeDetails: data.registrationFeeDetails as any,
        reregistrationFeeDetails: data.reregistrationFeeDetails as any,
        registrationFee,
        reregistrationFee,
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
    const updateData: any = {}
    
    if (data.name) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.startDate) updateData.startDate = new Date(data.startDate)
    if (data.endDate) updateData.endDate = new Date(data.endDate)
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    if (data.quota !== undefined) updateData.quota = data.quota
    if (data.lembagaId) updateData.lembagaId = data.lembagaId
    
    if (data.registrationFeeDetails !== undefined) {
      updateData.registrationFeeDetails = data.registrationFeeDetails as any
      updateData.registrationFee = calculateTotalFee(data.registrationFeeDetails as any)
    }
    
    if (data.reregistrationFeeDetails !== undefined) {
      updateData.reregistrationFeeDetails = data.reregistrationFeeDetails as any
      updateData.reregistrationFee = calculateTotalFee(data.reregistrationFeeDetails as any)
    }

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

    // Get period to copy fee details
    const period = data.periodId ? await prisma.pSBPeriod.findUnique({
      where: { id: data.periodId }
    }) : null

    const registration = await prisma.pSBRegistration.create({
      data: {
        registrationNo,
        name: data.name,
        nisn: data.nisn,
        gender: data.gender,
        birthPlace: data.birthPlace,
        birthDate: new Date(data.birthDate),
        address: data.address,
        fatherName: data.fatherName,
        motherName: data.motherName,
        phone: data.phone,
        schoolOrigin: data.schoolOrigin,
        schoolAddress: data.schoolAddress,
        schoolNpsn: data.schoolNpsn,
        periodId: data.periodId,
        trackId: data.trackId,
        paymentProof: data.paymentProof,
        status: 'PENDING',
        paymentStatus: data.paymentProof ? 'PAID' : 'UNPAID',
        registrationFee: period?.registrationFee,
        registrationFeeDetails: period?.registrationFeeDetails as any,
        reregistrationFeeDetails: period?.reregistrationFeeDetails as any,
      }
    })
    return { success: true, data: registration }
  } catch (error) {
    console.error('Failed to create registration:', error)
    return { success: false, error: 'Gagal melakukan pendaftaran' }
  }
}

export async function getPSBRegistrations(filters?: { periodId?: string, status?: string, lembagaId?: string }) {
  try {
    const where: any = {}
    if (filters?.periodId && filters.periodId !== 'all') where.periodId = filters.periodId
    if (filters?.status && filters.status !== 'all') where.status = filters.status
    if (filters?.lembagaId) where.assignedLembagaId = filters.lembagaId

    return await prisma.pSBRegistration.findMany({
      where,
      include: {
        period: { include: { lembaga: true } },
        track: true,
        assignedLembaga: true,
        assignedKelas: true,
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
        period: { include: { lembaga: true } },
        track: true,
        assignedLembaga: true,
        assignedKelas: true,
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
        period: { include: { lembaga: true } },
        track: true,
        assignedLembaga: true,
        assignedKelas: true,
      }
    })
  } catch (error) {
    console.error('Error fetching registration:', error)
    return null
  }
}

// Payment Verification
export async function verifyPayment(registrationId: string, verified: boolean, verifiedBy?: string) {
  try {
    const registration = await prisma.pSBRegistration.update({
      where: { id: registrationId },
      data: {
        paymentStatus: verified ? 'VERIFIED' : 'UNPAID',
        paymentVerifiedAt: verified ? new Date() : null,
        paymentVerifiedBy: verified ? verifiedBy : null,
        status: verified ? 'PAYMENT_VERIFIED' : 'PENDING',
      }
    })
    revalidatePath('/dashboard/psb')
    return { success: true, data: registration }
  } catch (error) {
    console.error('Failed to verify payment:', error)
    return { success: false, error: 'Gagal memverifikasi pembayaran' }
  }
}

// Applicant Assignment
export async function assignApplicant(registrationId: string, lembagaId: string, kelasId: string, assignedBy?: string) {
  try {
    const registration = await prisma.pSBRegistration.update({
      where: { id: registrationId },
      data: {
        assignedLembagaId: lembagaId,
        assignedKelasId: kelasId,
        assignedAt: new Date(),
        assignedBy,
        status: 'ASSIGNED',
      }
    })
    revalidatePath('/dashboard/psb')
    return { success: true, data: registration }
  } catch (error) {
    console.error('Failed to assign applicant:', error)
    return { success: false, error: 'Gagal meng-assign pendaftar' }
  }
}

// Re-registration
export async function uploadReregistrationProof(registrationId: string, proofUrl: string) {
  try {
    const registration = await prisma.pSBRegistration.update({
      where: { id: registrationId },
      data: {
        reregistrationProof: proofUrl,
        reregistrationStatus: 'PAID',
      }
    })
    return { success: true, data: registration }
  } catch (error) {
    console.error('Failed to upload proof:', error)
    return { success: false, error: 'Gagal mengupload bukti pembayaran' }
  }
}

export async function verifyReregistration(registrationId: string, verified: boolean) {
  try {
    const registration = await prisma.pSBRegistration.findUnique({
      where: { id: registrationId },
      include: { assignedLembaga: true, assignedKelas: true }
    })

    if (!registration) {
      return { success: false, error: 'Pendaftar tidak ditemukan' }
    }

    if (!registration.assignedLembagaId || !registration.assignedKelasId) {
      return { success: false, error: 'Pendaftar belum di-assign ke lembaga dan kelas' }
    }

    // Update registration status
    const updatedRegistration = await prisma.pSBRegistration.update({
      where: { id: registrationId },
      data: {
        reregistrationStatus: verified ? 'VERIFIED' : 'UNPAID',
        reregistrationVerifiedAt: verified ? new Date() : null,
        status: verified ? 'CONFIRMED' : 'ASSIGNED',
      }
    })

    // If verified, auto-create Santri
    if (verified) {
      const santriResult = await createSantriFromRegistration(registrationId)
      if (!santriResult.success) {
        return santriResult
      }
    }

    revalidatePath('/dashboard/psb')
    return { success: true, data: updatedRegistration }
  } catch (error) {
    console.error('Failed to verify re-registration:', error)
    return { success: false, error: 'Gagal memverifikasi daftar ulang' }
  }
}

// Auto-create Santri from Registration
export async function createSantriFromRegistration(registrationId: string) {
  try {
    const registration = await prisma.pSBRegistration.findUnique({
      where: { id: registrationId }
    })

    if (!registration) {
      return { success: false, error: 'Pendaftar tidak ditemukan' }
    }

    if (registration.santriId) {
      return { success: false, error: 'Santri sudah dibuat untuk pendaftar ini' }
    }

    if (!registration.assignedLembagaId || !registration.assignedKelasId) {
      return { success: false, error: 'Pendaftar belum di-assign ke lembaga dan kelas' }
    }

    // Generate NIS
    const year = new Date().getFullYear()
    const count = await prisma.santri.count()
    const nis = `${year}${(count + 1).toString().padStart(4, '0')}`

    // Create Santri
    const santri = await prisma.santri.create({
      data: {
        nis,
        nisn: registration.nisn,
        nama: registration.name,
        gender: registration.gender,
        birthPlace: registration.birthPlace,
        birthDate: registration.birthDate,
        address: registration.address,
        phone: registration.phone,
        fatherName: registration.fatherName,
        motherName: registration.motherName,
        previousSchool: registration.schoolOrigin,
        lembagaId: registration.assignedLembagaId,
        kelasId: registration.assignedKelasId,
        status: 'ACTIVE',
        entryDate: new Date(),
      }
    })

    // Link santri to registration
    await prisma.pSBRegistration.update({
      where: { id: registrationId },
      data: { santriId: santri.id }
    })

    revalidatePath('/dashboard/santri')
    revalidatePath('/dashboard/psb')
    
    return { success: true, data: santri }
  } catch (error) {
    console.error('Failed to create santri:', error)
    return { success: false, error: 'Gagal membuat data santri' }
  }
}

// Decline Assignment
export async function declineAssignment(registrationId: string) {
  try {
    const registration = await prisma.pSBRegistration.update({
      where: { id: registrationId },
      data: { status: 'DECLINED' }
    })
    return { success: true, data: registration }
  } catch (error) {
    console.error('Failed to decline assignment:', error)
    return { success: false, error: 'Gagal menolak penempatan' }
  }
}

'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

export async function submitRegistration(formData: FormData) {
  try {
    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: formData.get('username') as string }
    })

    if (existingUser) {
      return { success: false, error: 'Username sudah digunakan' }
    }

    // Check if username already in pending registrations
    const existingRegistration = await prisma.userRegistration.findUnique({
      where: { username: formData.get('username') as string }
    })

    if (existingRegistration && existingRegistration.status === 'PENDING') {
      return { success: false, error: 'Pendaftaran dengan username ini sedang menunggu persetujuan' }
    }

    const data = {
      name: formData.get('name') as string,
      username: formData.get('username') as string,
      email: formData.get('email') as string || null,
      phone: formData.get('phone') as string || null,
      requestedRole: formData.get('requestedRole') as string,
      reason: formData.get('reason') as string || null,
      status: 'PENDING',
    }

    await prisma.userRegistration.create({ data })
    
    return { success: true }
  } catch (error) {
    console.error('Submit registration error:', error)
    return { success: false, error: 'Gagal mengirim pendaftaran' }
  }
}

export async function getPendingRegistrations() {
  return await prisma.userRegistration.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'desc' }
  })
}

export async function getAllRegistrations() {
  return await prisma.userRegistration.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export async function approveRegistration(
  registrationId: string,
  adminId: string,
  assignToProfileId?: string // ustadzProfileId jika role USTADZ/MUDIR/dll
) {
  try {
    const registration = await prisma.userRegistration.findUnique({
      where: { id: registrationId }
    })

    if (!registration || registration.status !== 'PENDING') {
      return { success: false, error: 'Pendaftaran tidak valid' }
    }

    // Determine roles based on profile assignment
    let userRoles: string[] = [registration.requestedRole]
    let primaryRole = registration.requestedRole

    // If assigned to profile, load profile and detect roles from assignments
    if (assignToProfileId && 
        ['USTADZ', 'MUDIR', 'PENGURUS', 'MUSYRIF'].includes(registration.requestedRole)) {
      
      const profile = await prisma.ustadzProfile.findUnique({
        where: { id: assignToProfileId },
        include: {
          lembagaAsMudir: true,
          homeroomClasses: true,
          mapels: true,
          halqohs: true,
        }
      })

      if (profile) {
        const detectedRoles = new Set<string>()

        // Auto-detect roles based on assignments
        if (profile.lembagaAsMudir.length > 0) {
          detectedRoles.add('MUDIR')
        }
        if (profile.mapels.length > 0) {
          detectedRoles.add('USTADZ')
        }
        if (profile.halqohs.length > 0) {
          detectedRoles.add('MUSYRIF')
        }
        if (profile.homeroomClasses.length > 0) {
          detectedRoles.add('USTADZ') // Wali kelas biasanya ustadz
        }

        // Merge with requested role
        userRoles = Array.from(new Set([...detectedRoles, registration.requestedRole]))
        
        // Set primary role based on priority: MUDIR > USTADZ > MUSYRIF > PENGURUS
        if (userRoles.includes('MUDIR')) {
          primaryRole = 'MUDIR'
        } else if (userRoles.includes('USTADZ')) {
          primaryRole = 'USTADZ'
        } else if (userRoles.includes('MUSYRIF')) {
          primaryRole = 'MUSYRIF'
        } else if (userRoles.includes('PENGURUS')) {
          primaryRole = 'PENGURUS'
        }
      }
    }

    // Create user with default password
    const defaultPassword = await bcrypt.hash('password123', 10)
    
    const newUser = await prisma.user.create({
      data: {
        name: registration.name,
        username: registration.username,
        password: defaultPassword,
        role: primaryRole,
        roles: JSON.stringify(userRoles),
      }
    })

    // Update registration status
    await prisma.userRegistration.update({
      where: { id: registrationId },
      data: {
        status: 'APPROVED',
        reviewedBy: adminId,
        reviewedAt: new Date(),
        userId: newUser.id,
      }
    })

    // If assigned to profile, link the user
    if (assignToProfileId && 
        ['USTADZ', 'MUDIR', 'PENGURUS', 'MUSYRIF'].includes(registration.requestedRole)) {
      await prisma.ustadzProfile.update({
        where: { id: assignToProfileId },
        data: { userId: newUser.id }
      })
    }

    revalidatePath('/dashboard/users/registrations')
    return { 
      success: true, 
      userId: newUser.id,
      defaultPassword: 'password123',
      assignedRoles: userRoles 
    }
  } catch (error) {
    console.error('Approve registration error:', error)
    return { success: false, error: 'Gagal menyetujui pendaftaran' }
  }
}

export async function rejectRegistration(
  registrationId: string,
  adminId: string,
  notes?: string
) {
  try {
    await prisma.userRegistration.update({
      where: { id: registrationId },
      data: {
        status: 'REJECTED',
        reviewedBy: adminId,
        reviewedAt: new Date(),
        reviewNotes: notes,
      }
    })

    revalidatePath('/dashboard/users/registrations')
    return { success: true }
  } catch (error) {
    console.error('Reject registration error:', error)
    return { success: false, error: 'Gagal menolak pendaftaran' }
  }
}

export async function getRegistrationStats() {
  const registrations = await prisma.userRegistration.findMany()
  
  return {
    total: registrations.length,
    pending: registrations.filter(r => r.status === 'PENDING').length,
    approved: registrations.filter(r => r.status === 'APPROVED').length,
    rejected: registrations.filter(r => r.status === 'REJECTED').length,
  }
}

// Get ustadz profiles with full assignments for registration approval
export async function getUstadzProfilesForRegistration() {
  return await prisma.ustadzProfile.findMany({
    include: {
      user: true,
      lembagaAsMudir: {
        select: { id: true, name: true }
      },
      homeroomClasses: {
        select: { id: true, lembagaId: true }
      },
      mapels: {
        select: { 
          id: true,
          kelas: {
            select: { lembagaId: true }
          }
        }
      },
      halqohs: {
        select: { id: true }
      },
    },
    orderBy: { id: 'desc' }
  })
}


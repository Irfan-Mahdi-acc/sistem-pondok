'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { encrypt, decrypt } from "@/lib/encryption"
import { parseRoles } from "@/lib/role-utils"

const UstadzSchema = z.object({
  userId: z.string().optional(),
  nik: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  birthPlace: z.string().optional(),
  birthDate: z.string().optional(),
  specialization: z.string().optional(),
  education: z.string().optional(),
  status: z.string().default('ACTIVE'),
  name: z.string().min(1), // Required if no userId
})

export async function getUstadzList() {
  const allUstadz = await prisma.ustadzProfile.findMany({
    include: {
      user: true,
      mapels: {
        include: {
          kelas: true
        }
      },
      halqohs: {
        include: {
          _count: {
            select: {
              santris: true
            }
          }
        }
      },
      _count: {
        select: {
          mapels: true,
          halqohs: true,
          tahfidzRecords: true,
        }
      }
    },
    orderBy: { id: 'desc' }
  })

  // Filter to only show users with USTADZ role (supports multi-role)
  const ustadzList = allUstadz.filter(ustadz => {
    if (!ustadz.user) return false
    const rolesArray = parseRoles(ustadz.user.roles) || [ustadz.user.role]
    return rolesArray.includes('USTADZ')
  })

  // Decrypt sensitive fields before sending to client
  return ustadzList.map(ustadz => ({
    ...ustadz,
    nik: ustadz.nik ? decrypt(ustadz.nik) : null,
    phone: ustadz.phone ? decrypt(ustadz.phone) : null,
    address: ustadz.address ? decrypt(ustadz.address) : null,
  }))
}

export async function getUstadzById(id: string) {
  const ustadz = await prisma.ustadzProfile.findUnique({
    where: { id },
    include: {
      user: true,
      mapels: {
        include: {
          kelas: {
            include: {
              lembaga: true
            }
          }
        }
      },
      halqohs: {
        include: {
          santris: true
        }
      },
      tahfidzRecords: {
        include: {
          santri: true
        },
        orderBy: { date: 'desc' },
        take: 20
      }
    }
  })

  if (!ustadz) return null

  // Decrypt sensitive fields
  return {
    ...ustadz,
    nik: ustadz.nik ? decrypt(ustadz.nik) : null,
    phone: ustadz.phone ? decrypt(ustadz.phone) : null,
    address: ustadz.address ? decrypt(ustadz.address) : null,
  }
}

export async function createUstadz(formData: FormData) {
  try {
    const userId = formData.get('userId') as string
    const name = formData.get('name') as string
    const nik = formData.get('nik') as string
    const phone = formData.get('phone') as string
    const address = formData.get('address') as string
    const birthPlace = formData.get('birthPlace') as string
    const birthDate = formData.get('birthDate') as string
    const specialization = formData.get('specialization') as string
    const education = formData.get('education') as string

    // Validate: name is required
    if (!name) {
      return { success: false, error: 'Nama wajib diisi' }
    }

    // If no userId provided, create a temporary user
    let finalUserId = userId && userId !== '' ? userId : null
    
    if (!finalUserId) {
      // Create temporary user for binding later
      const tempUser = await prisma.user.create({
        data: {
          username: `temp_${Date.now()}`,
          password: await bcrypt.hash('temp123', 10),
          name: name,
          role: 'USTADZ',
          roles: JSON.stringify(['USTADZ']),
        }
      })
      finalUserId = tempUser.id
    }

    await prisma.ustadzProfile.create({
      data: {
        userId: finalUserId,
        // Encrypt sensitive fields
        nik: nik ? encrypt(nik) : null,
        phone: phone ? encrypt(phone) : null,
        address: address ? encrypt(address) : null,
        birthPlace: birthPlace || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        specialization: specialization || null,
        education: education || null,
        status: 'ACTIVE',
      }
    })

    revalidatePath('/dashboard/ustadz')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Failed to create ustadz profile' }
  }
}

export async function updateUstadz(id: string, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries())
  const validatedData = UstadzSchema.safeParse(rawData)

  if (!validatedData.success) {
    return { success: false, error: validatedData.error.flatten() }
  }

  try {
    const data = validatedData.data
    await prisma.ustadzProfile.update({
      where: { id },
      data: {
        // Encrypt sensitive fields
        nik: data.nik ? encrypt(data.nik) : null,
        phone: data.phone ? encrypt(data.phone) : null,
        address: data.address ? encrypt(data.address) : null,
        birthPlace: data.birthPlace || null,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        specialization: data.specialization || null,
        education: data.education || null,
        status: data.status,
      }
    })

    revalidatePath('/dashboard/ustadz')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to update ustadz profile' }
  }
}

export async function deleteUstadz(id: string) {
  try {
    await prisma.ustadzProfile.delete({
      where: { id },
    })
    revalidatePath('/dashboard/ustadz')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete ustadz profile' }
  }
}

export async function getUsersWithoutUstadzProfile() {
  const usersWithProfile = await prisma.ustadzProfile.findMany({
    select: { userId: true }
  })
  // Filter out null values before using in notIn
  const userIds = usersWithProfile.map(u => u.userId).filter((id): id is string => id !== null)
  
  return await prisma.user.findMany({
    where: {
      id: {
        notIn: userIds
      }
    },
    orderBy: { name: 'asc' }
  })
}

export async function getAvailableUsers() {
  try {
    // Get users that already have ustadz profile linked
    const usersWithProfile = await prisma.ustadzProfile.findMany({
      select: { userId: true }
    })
    const linkedUserIds = usersWithProfile.map(u => u.userId).filter(Boolean)
    
    // Get all users not linked yet and not temp users
    // Show ALL available users, not just those with USTADZ role
    // USTADZ role will be added automatically when linking
    const users = await prisma.user.findMany({
      where: {
        id: {
          notIn: linkedUserIds
        },
        // Exclude temp users
        username: {
          not: {
            startsWith: 'temp_'
          }
        }
      },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        roles: true,
      },
      orderBy: { name: 'asc' }
    })
    
    return users
  } catch (error) {
    console.error('Get available users error:', error)
    return []
  }
}

export async function updateUstadzStatus(id: string, status: string) {
  try {
    await prisma.ustadzProfile.update({
      where: { id },
      data: { status }
    })
    revalidatePath('/dashboard/ustadz')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to update status' }
  }
}

export async function linkUstadzToUser(ustadzId: string, userId: string) {
  try {
    // Get the user to check their current roles
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, roles: true }
    })

    if (!user) {
      return { success: false, error: 'User tidak ditemukan' }
    }

    // Check if user already has USTADZ role
    const currentRoles = parseRoles(user.roles) || [user.role]
    const hasUstadzRole = currentRoles.includes('USTADZ')

    // If user doesn't have USTADZ role, add it
    if (!hasUstadzRole) {
      const newRoles = [...currentRoles, 'USTADZ']
      await prisma.user.update({
        where: { id: userId },
        data: {
          roles: JSON.stringify(newRoles)
        }
      })
    }

    // Link ustadz profile to user
    await prisma.ustadzProfile.update({
      where: { id: ustadzId },
      data: { userId }
    })
    
    revalidatePath('/dashboard/ustadz')
    revalidatePath('/dashboard/users')
    return { success: true }
  } catch (error) {
    console.error('Link ustadz to user error:', error)
    return { success: false, error: 'Gagal menghubungkan ustadz ke user' }
  }
}

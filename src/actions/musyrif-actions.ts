'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { encrypt, decrypt } from "@/lib/encryption"
import { parseRoles } from "@/lib/role-utils"

export async function getMusyrifList() {
  const allMusyrif = await prisma.ustadzProfile.findMany({
    include: {
      user: true,
      _count: {
        select: {
          mapels: true,
          halqohs: true,
        }
      }
    },
    orderBy: { user: { name: 'asc' } }
  })

  // Filter to only show users with MUSYRIF role (supports multi-role)
  const musyrifList = allMusyrif.filter(musyrif => {
    if (!musyrif.user) return false
    const rolesArray = parseRoles(musyrif.user.roles) || [musyrif.user.role]
    return rolesArray.includes('MUSYRIF')
  })

  // Decrypt sensitive fields
  return musyrifList.map(musyrif => ({
    ...musyrif,
    nik: musyrif.nik ? decrypt(musyrif.nik) : null,
    phone: musyrif.phone ? decrypt(musyrif.phone) : null,
    address: musyrif.address ? decrypt(musyrif.address) : null,
  }))
}

export async function createMusyrif(formData: FormData) {
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

    // If no userId provided, create a temporary user first
    let finalUserId = userId && userId !== '' ? userId : null
    
    if (!finalUserId) {
      if (!name) {
        return { success: false, error: 'Nama wajib diisi jika tidak menghubungkan ke user' }
      }
      
      // Hash temporary password
      const hashedPassword = await bcrypt.hash('temp', 12)
      
      // Create temporary user
      const tempUser = await prisma.user.create({
        data: {
          username: `temp_musyrif_${Date.now()}`,
          password: hashedPassword,
          name: name,
          role: 'MUSYRIF',
          roles: JSON.stringify(['MUSYRIF']),
          passwordChangedAt: new Date(),
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

    revalidatePath('/dashboard/musyrif')
    return { success: true }
  } catch (error) {
    console.error('Create musyrif error:', error)
    return { success: false, error: 'Failed to create musyrif profile' }
  }
}

export async function updateMusyrif(id: string, formData: FormData) {
  try {
    const nik = formData.get('nik') as string
    const phone = formData.get('phone') as string
    const address = formData.get('address') as string
    const birthPlace = formData.get('birthPlace') as string
    const birthDate = formData.get('birthDate') as string
    const specialization = formData.get('specialization') as string
    const education = formData.get('education') as string
    const status = formData.get('status') as string

    await prisma.ustadzProfile.update({
      where: { id },
      data: {
        nik: nik || undefined,
        phone: phone || undefined,
        address: address || undefined,
        birthPlace: birthPlace || undefined,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        specialization: specialization || undefined,
        education: education || undefined,
        status: status || 'ACTIVE',
      }
    })

    revalidatePath('/dashboard/musyrif')
    return { success: true }
  } catch (error) {
    console.error('Update musyrif error:', error)
    return { success: false, error: 'Failed to update musyrif profile' }
  }
}

export async function deleteMusyrif(id: string) {
  try {
    await prisma.ustadzProfile.delete({
      where: { id }
    })
    
    revalidatePath('/dashboard/musyrif')
    return { success: true }
  } catch (error) {
    console.error('Delete musyrif error:', error)
    return { success: false, error: 'Failed to delete musyrif profile' }
  }
}

export async function getAvailableMusyrifUsers() {
  try {
    const usersWithProfile = await prisma.ustadzProfile.findMany({
      select: { userId: true }
    })
    const linkedUserIds = usersWithProfile.map(u => u.userId).filter((id): id is string => id !== null)
    
    const users = await prisma.user.findMany({
      where: {
        role: 'MUSYRIF',
        id: {
          notIn: linkedUserIds
        },
        // Exclude temp users
        username: {
          not: {
            startsWith: 'temp_'
          }
        },
        // Only show approved users
        isApproved: true
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
      },
      orderBy: { name: 'asc' }
    })
    
    return users
  } catch (error) {
    console.error('Get available musyrif users error:', error)
    return []
  }
}


export async function linkMusyrifToUser(musyrifId: string, userId: string) {
  try {
    // Check if user is already linked to another profile
    const existingProfile = await prisma.ustadzProfile.findFirst({
      where: { userId }
    })

    if (existingProfile) {
      return { success: false, error: 'User sudah terhubung ke profil lain' }
    }

    // Get the musyrif profile
    const musyrif = await prisma.ustadzProfile.findUnique({
      where: { id: musyrifId },
      include: { user: true }
    })

    if (!musyrif) {
      return { success: false, error: 'Musyrif tidak ditemukan' }
    }

    // If current user is temporary, delete it
    if (musyrif.user?.username.startsWith('temp_') && musyrif.userId) {
      await prisma.user.delete({
        where: { id: musyrif.userId }
      })
    }

    // Update musyrif with new userId
    await prisma.ustadzProfile.update({
      where: { id: musyrifId },
      data: { userId }
    })

    revalidatePath('/dashboard/musyrif')
    return { success: true }
  } catch (error) {
    console.error('Link musyrif to user error:', error)
    return { success: false, error: 'Gagal menghubungkan musyrif ke user' }
  }
}

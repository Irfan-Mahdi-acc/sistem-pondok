'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { encrypt, decrypt } from "@/lib/encryption"

export async function getPengurusList() {
  const allPengurus = await prisma.ustadzProfile.findMany({
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

  // Filter to only show users with PENGURUS role (supports multi-role)
  const pengurusList = allPengurus.filter(pengurus => {
    if (!pengurus.user) return false
    try {
      const rolesArray = pengurus.user.roles ? JSON.parse(pengurus.user.roles) : [pengurus.user.role]
      return rolesArray.includes('PENGURUS')
    } catch {
      return pengurus.user.role === 'PENGURUS'
    }
  })

  // Decrypt sensitive fields
  return pengurusList.map(pengurus => ({
    ...pengurus,
    nik: pengurus.nik ? decrypt(pengurus.nik) : null,
    phone: pengurus.phone ? decrypt(pengurus.phone) : null,
    address: pengurus.address ? decrypt(pengurus.address) : null,
  }))
}

export async function createPengurus(formData: FormData) {
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
          username: `temp_pengurus_${Date.now()}`,
          password: hashedPassword,
          name: name,
          role: 'PENGURUS',
          roles: JSON.stringify(['PENGURUS']),
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

    revalidatePath('/dashboard/pengurus')
    return { success: true }
  } catch (error) {
    console.error('Create pengurus error:', error)
    return { success: false, error: 'Failed to create pengurus profile' }
  }
}

export async function updatePengurus(id: string, formData: FormData) {
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

    revalidatePath('/dashboard/pengurus')
    return { success: true }
  } catch (error) {
    console.error('Update pengurus error:', error)
    return { success: false, error: 'Failed to update pengurus profile' }
  }
}

export async function deletePengurus(id: string) {
  try {
    await prisma.ustadzProfile.delete({
      where: { id }
    })
    
    revalidatePath('/dashboard/pengurus')
    return { success: true }
  } catch (error) {
    console.error('Delete pengurus error:', error)
    return { success: false, error: 'Failed to delete pengurus profile' }
  }
}

export async function getAvailablePengurusUsers() {
  try {
    const usersWithProfile = await prisma.ustadzProfile.findMany({
      select: { userId: true }
    })
    const linkedUserIds = usersWithProfile.map(u => u.userId).filter(Boolean)
    
    const users = await prisma.user.findMany({
      where: {
        role: 'PENGURUS',
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
      },
      orderBy: { name: 'asc' }
    })
    
    return users
  } catch (error) {
    console.error('Get available pengurus users error:', error)
    return []
  }
}

export async function linkPengurusToUser(pengurusId: string, userId: string) {
  try {
    // Check if user is already linked to another profile
    const existingProfile = await prisma.ustadzProfile.findFirst({
      where: { userId }
    })

    if (existingProfile) {
      return { success: false, error: 'User sudah terhubung ke profil lain' }
    }

    // Get the pengurus profile
    const pengurus = await prisma.ustadzProfile.findUnique({
      where: { id: pengurusId },
      include: { user: true }
    })

    if (!pengurus) {
      return { success: false, error: 'Pengurus tidak ditemukan' }
    }

    // If current user is temporary, delete it
    if (pengurus.user.username.startsWith('temp_')) {
      await prisma.user.delete({
        where: { id: pengurus.userId }
      })
    }

    // Update pengurus with new userId
    await prisma.ustadzProfile.update({
      where: { id: pengurusId },
      data: { userId }
    })

    revalidatePath('/dashboard/pengurus')
    return { success: true }
  } catch (error) {
    console.error('Link pengurus to user error:', error)
    return { success: false, error: 'Gagal menghubungkan pengurus ke user' }
  }
}

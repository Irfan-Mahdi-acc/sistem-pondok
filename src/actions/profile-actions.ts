'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function getCurrentUser() {
  const session = await auth()
  if (!session?.user?.id) {
    return null
  }

  return await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      roles: true,
      avatarUrl: true,
      createdAt: true,
      passwordChangedAt: true,
    }
  })
}

export async function updateProfile(data: {
  name?: string
  avatarUrl?: string
}) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Tidak terautentikasi' }
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
      }
    })

    revalidatePath('/dashboard/profile')
    return { success: true }
  } catch (error) {
    console.error('Update profile error:', error)
    return { success: false, error: 'Gagal mengupdate profil' }
  }
}

export async function changePassword(data: {
  currentPassword: string
  newPassword: string
}) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Tidak terautentikasi' }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return { success: false, error: 'User tidak ditemukan' }
    }

    // Verify current password
    const passwordsMatch = await bcrypt.compare(data.currentPassword, user.password)
    if (!passwordsMatch) {
      return { success: false, error: 'Password lama tidak sesuai' }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(data.newPassword, 10)

    // Update password
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedPassword,
        passwordChangedAt: new Date(),
      }
    })

    revalidatePath('/dashboard/profile')
    return { success: true }
  } catch (error) {
    console.error('Change password error:', error)
    return { success: false, error: 'Gagal mengubah password' }
  }
}


'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { validatePassword } from "@/lib/password-validation"

const UserSchema = z.object({
  username: z.string().min(3),
  name: z.string().min(1),
  role: z.string(),
  password: z.string().min(8).optional(),
})

export async function getUsers() {
  const users = await prisma.user.findMany({
    where: {
      // Exclude temp users (temp_*)
      username: {
        not: {
          startsWith: 'temp_'
        }
      }
    },
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      roles: true,  // Add roles field
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' }
  })
  
  return users
}

export async function createUser(formData: FormData) {
  const rawData = {
    username: formData.get('username'),
    name: formData.get('name'),
    role: formData.get('role'),
    password: formData.get('password'),
  }

  const validatedData = UserSchema.parse(rawData)
  
  if (!validatedData.password) {
    throw new Error("Password is required for new users")
  }

  // Validate password strength
  const passwordValidation = validatePassword(validatedData.password)
  if (!passwordValidation.isValid) {
    throw new Error(`Password tidak memenuhi syarat: ${passwordValidation.errors.join(', ')}`)
  }

  // Hash password with 12 rounds (increased from 10)
  const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || '12')
  const hashedPassword = await bcrypt.hash(validatedData.password, bcryptRounds)

  try {
    await prisma.user.create({
      data: {
        username: validatedData.username,
        name: validatedData.name,
        role: validatedData.role,
        password: hashedPassword,
        passwordChangedAt: new Date(),
      },
    })
    revalidatePath('/dashboard/users')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to create user' }
  }
}

export async function updateUser(id: string, data: { name: string; username: string; roles: string[]; password?: string }) {
  try {
    console.log('updateUser called with roles:', data.roles)
    
    const updateData: any = {
      name: data.name,
      username: data.username,
      roles: data.roles, // PostgreSQL Json type - no stringify needed!
      // Also update old role field for backward compatibility
      role: data.roles[0] || 'SANTRI',
    }

    console.log('Roles data:', updateData.roles)

    // Hash password if provided
    if (data.password) {
      const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || '12')
      updateData.password = await bcrypt.hash(data.password, bcryptRounds)
      updateData.passwordChangedAt = new Date()
    }

    await prisma.user.update({
      where: { id },
      data: updateData
    })
    
    console.log('User updated successfully')
    revalidatePath('/dashboard/users')
    return { success: true }
  } catch (error) {
    console.error('Update user error:', error)
    return { success: false, error: 'Failed to update user' }
  }
}

export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({
      where: { id },
    })
    revalidatePath('/dashboard/users')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete user' }
  }
}

export async function cleanupTempUsers() {
  try {
    // Find all temp users
    const tempUsers = await prisma.user.findMany({
      where: {
        username: {
          startsWith: 'temp_'
        }
      },
      include: {
        ustadzProfile: true,
        santriProfile: true,
      }
    })

    // Filter temp users that are NOT linked to any profile
    const orphanedTempUsers = tempUsers.filter(user => 
      !user.ustadzProfile && !user.santriProfile
    )

    // Delete orphaned temp users
    const deletePromises = orphanedTempUsers.map(user =>
      prisma.user.delete({ where: { id: user.id } })
    )

    await Promise.all(deletePromises)

    revalidatePath('/dashboard/users')
    return { 
      success: true, 
      deletedCount: orphanedTempUsers.length,
      message: `Deleted ${orphanedTempUsers.length} unused temp users`
    }
  } catch (error) {
    console.error('Cleanup temp users error:', error)
    return { success: false, error: 'Failed to cleanup temp users' }
  }
}

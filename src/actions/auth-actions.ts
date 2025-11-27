'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

/**
 * Verify current user's password (Server Action)
 * @param password - Password to verify
 * @returns true if password matches current user's password
 */
export async function verifyUserPassword(password: string): Promise<boolean> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return false
    }
    
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true }
    })
    
    if (!user) {
      return false
    }
    
    return await bcrypt.compare(password, user.password)
  } catch (error) {
    console.error('Password verification error:', error)
    return false
  }
}

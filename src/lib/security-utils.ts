/**
 * General Security Utilities
 * 
 * Provides various security-related helper functions.
 */

import { auth } from '@/auth'

/**
 * Verify user's password for sensitive operations
 * @param password - Password to verify
 * @returns true if password matches current user's password
 */
export async function verifyCurrentUserPassword(password: string): Promise<boolean> {
  const bcrypt = await import('bcryptjs')
  const { prisma } = await import('@/lib/prisma')
  
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
  
  return bcrypt.compare(password, user.password)
}

/**
 * Check if user account is locked due to failed login attempts
 * @param userId - User ID to check
 * @returns true if account is locked
 */
export async function isAccountLocked(userId: string): Promise<boolean> {
  const { prisma } = await import('@/lib/prisma')
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lockedUntil: true }
  })
  
  if (!user?.lockedUntil) {
    return false
  }
  
  return new Date() < user.lockedUntil
}

/**
 * Record failed login attempt
 * @param username - Username that failed login
 */
export async function recordFailedLogin(username: string): Promise<void> {
  const { prisma } = await import('@/lib/prisma')
  
  const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5')
  const lockDuration = parseInt(process.env.LOCK_DURATION_MINUTES || '30')
  
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, failedLoginAttempts: true }
  })
  
  if (!user) return
  
  const newAttempts = (user.failedLoginAttempts || 0) + 1
  const shouldLock = newAttempts >= maxAttempts
  
  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: newAttempts,
      lockedUntil: shouldLock 
        ? new Date(Date.now() + lockDuration * 60 * 1000)
        : null
    }
  })
}

/**
 * Reset failed login attempts after successful login
 * @param userId - User ID
 */
export async function resetFailedLogins(userId: string): Promise<void> {
  const { prisma } = await import('@/lib/prisma')
  
  await prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null
    }
  })
}

/**
 * Sanitize user input to prevent XSS
 * @param input - User input string
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Mask sensitive data for display
 * @param data - Sensitive data to mask
 * @param visibleChars - Number of characters to show at end (default: 4)
 * @returns Masked string
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (!data || data.length <= visibleChars) {
    return '***'
  }
  
  const masked = '*'.repeat(data.length - visibleChars)
  const visible = data.slice(-visibleChars)
  
  return masked + visible
}

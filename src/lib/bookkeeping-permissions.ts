import { auth } from '@/auth'
import { prisma } from './prisma'

export type BookkeepingAccess = {
  canView: boolean
  canEdit: boolean
  canDelete: boolean
  canAssign: boolean
  role?: 'MANAGER' | 'EDITOR' | 'VIEWER' | null
  userId?: string
}

/**
 * Check user's access level to a specific bookkeeping
 */
export async function getBookkeepingAccess(bookkeepingId: string): Promise<BookkeepingAccess> {
  const session = await auth()
  
  if (!session?.user) {
    return {
      canView: false,
      canEdit: false,
      canDelete: false,
      canAssign: false,
    }
  }

  const userId = session.user.id
  const userRole = session.user.role

  // Super Admin has full access
  if (userRole === 'SUPER_ADMIN') {
    return {
      canView: true,
      canEdit: true,
      canDelete: true,
      canAssign: true,
      role: 'MANAGER',
      userId,
    }
  }

  // Bendahara has full access except delete
  if (userRole === 'BENDAHARA') {
    return {
      canView: true,
      canEdit: true,
      canDelete: false,
      canAssign: true,
      role: 'MANAGER',
      userId,
    }
  }

  // Check assignment
  const assignment = await prisma.bookkeepingAssignment.findFirst({
    where: {
      bookkeepingId,
      userId,
    }
  })

  if (!assignment) {
    return {
      canView: false,
      canEdit: false,
      canDelete: false,
      canAssign: false,
      userId,
    }
  }

  // Access based on assignment role
  switch (assignment.role) {
    case 'MANAGER':
      return {
        canView: true,
        canEdit: true,
        canDelete: false,
        canAssign: true,
        role: 'MANAGER',
        userId,
      }
    case 'EDITOR':
      return {
        canView: true,
        canEdit: true,
        canDelete: false,
        canAssign: false,
        role: 'EDITOR',
        userId,
      }
    case 'VIEWER':
      return {
        canView: true,
        canEdit: false,
        canDelete: false,
        canAssign: false,
        role: 'VIEWER',
        userId,
      }
    default:
      return {
        canView: false,
        canEdit: false,
        canDelete: false,
        canAssign: false,
        userId,
      }
  }
}

/**
 * Check if user can create bookkeeping
 */
export async function canCreateBookkeeping(): Promise<boolean> {
  const session = await auth()
  if (!session?.user) return false

  const userRole = session.user.role
  return userRole === 'SUPER_ADMIN' || userRole === 'BENDAHARA'
}

/**
 * Get all bookkeeping user has access to
 */
export async function getAccessibleBookkeepingIds(): Promise<string[]> {
  const session = await auth()
  if (!session?.user) return []

  const userId = session.user.id
  const userRole = session.user.role

  // Super Admin and Bendahara can access all
  if (userRole === 'SUPER_ADMIN' || userRole === 'BENDAHARA') {
    const all = await prisma.bookkeeping.findMany({
      select: { id: true }
    })
    return all.map(b => b.id)
  }

  // Get assigned bookkeepings
  const assignments = await prisma.bookkeepingAssignment.findMany({
    where: { userId },
    select: { bookkeepingId: true }
  })

  return assignments.map(a => a.bookkeepingId)
}


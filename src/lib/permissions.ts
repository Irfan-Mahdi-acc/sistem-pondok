import { auth } from '@/auth'
import { prisma } from './prisma'
import { cookies } from 'next/headers'

export type UserWithProfile = {
  id: string
  role: string
  ustadzProfile?: {
    id: string
    lembagaAsMudir: { id: string }[]
    homeroomClasses: { id: string; lembagaId: string }[]
    mapels: { id: string; kelas: { lembagaId: string } }[]
    halqohs: { id: string }[]
  } | null
}

/**
 * Get current user with profile and assignments
 */
export async function getCurrentUserWithProfile(): Promise<UserWithProfile | null> {
  const session = await auth()
  if (!session?.user?.id) return null

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      ustadzProfile: {
        include: {
          lembagaAsMudir: { select: { id: true } },
          homeroomClasses: { select: { id: true, lembagaId: true } },
          mapels: { 
            select: { 
              id: true, 
              kelas: { 
                select: { lembagaId: true } 
              } 
            } 
          },
          halqohs: { select: { id: true } },
        }
      }
    }
  })

  if (!user) return null

  // Get selected role from cookie
  const cookieStore = await cookies()
  const selectedRole = cookieStore.get('selected-role')?.value || user.role

  return {
    id: user.id,
    role: selectedRole,
    ustadzProfile: user.ustadzProfile
  }
}

/**
 * Check if user is admin or super admin
 */
export function isAdmin(user: UserWithProfile): boolean {
  return user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
}

/**
 * Check if user can access a specific lembaga
 */
export function canAccessLembaga(user: UserWithProfile, lembagaId: string): boolean {
  // Admin can access all
  if (isAdmin(user)) return true

  // Mudir can only access their assigned lembaga
  if (user.role === 'MUDIR' && user.ustadzProfile) {
    return user.ustadzProfile.lembagaAsMudir.some(l => l.id === lembagaId)
  }

  // Ustadz can access lembaga where they have assignments
  if (user.role === 'USTADZ' && user.ustadzProfile) {
    const hasMapel = user.ustadzProfile.mapels.some(m => m.kelas.lembagaId === lembagaId)
    const isWaliKelas = user.ustadzProfile.homeroomClasses.some(k => k.lembagaId === lembagaId)
    return hasMapel || isWaliKelas
  }

  // Pengurus, Musyrif can access their assigned lembaga
  if ((user.role === 'PENGURUS' || user.role === 'MUSYRIF') && user.ustadzProfile) {
    return user.ustadzProfile.mapels.some(m => m.kelas.lembagaId === lembagaId)
  }

  return false
}

/**
 * Get list of lembaga IDs that user can access
 */
export function getAccessibleLembagaIds(user: UserWithProfile): string[] {
  if (isAdmin(user)) {
    return [] // Empty array means all lembaga
  }

  if (!user.ustadzProfile) return []

  const lembagaIds = new Set<string>()

  // Mudir lembaga
  if (user.role === 'MUDIR') {
    user.ustadzProfile.lembagaAsMudir.forEach(l => lembagaIds.add(l.id))
  }

  // Ustadz/Pengurus/Musyrif assignments
  if (['USTADZ', 'PENGURUS', 'MUSYRIF'].includes(user.role)) {
    user.ustadzProfile.mapels.forEach(m => lembagaIds.add(m.kelas.lembagaId))
    user.ustadzProfile.homeroomClasses.forEach(k => lembagaIds.add(k.lembagaId))
  }

  return Array.from(lembagaIds)
}

/**
 * Check if user can edit a specific mapel
 */
export function canEditMapel(user: UserWithProfile, mapelId: string): boolean {
  if (isAdmin(user)) return true
  
  if (user.role === 'USTADZ' && user.ustadzProfile) {
    return user.ustadzProfile.mapels.some(m => m.id === mapelId)
  }

  return false
}

/**
 * Check if user can edit a specific halaqoh
 */
export function canEditHalaqoh(user: UserWithProfile, halaqohId: string): boolean {
  if (isAdmin(user)) return true
  
  if ((user.role === 'USTADZ' || user.role === 'MUSYRIF') && user.ustadzProfile) {
    return user.ustadzProfile.halqohs.some(h => h.id === halaqohId)
  }

  return false
}

/**
 * Check if user can manage lembaga (full access)
 */
export function canManageLembaga(user: UserWithProfile, lembagaId: string): boolean {
  if (isAdmin(user)) return true
  
  if (user.role === 'MUDIR' && user.ustadzProfile) {
    return user.ustadzProfile.lembagaAsMudir.some(l => l.id === lembagaId)
  }

  return false
}

/**
 * Check if user can view a kelas
 */
export function canViewKelas(user: UserWithProfile, kelasLembagaId: string): boolean {
  if (isAdmin(user)) return true
  
  return canAccessLembaga(user, kelasLembagaId)
}

/**
 * Filter query based on user permissions
 * Returns Prisma where clause
 */
export function getLembagaAccessFilter(user: UserWithProfile) {
  if (isAdmin(user)) {
    return {} // No filter for admin
  }

  const accessibleIds = getAccessibleLembagaIds(user)
  
  if (accessibleIds.length === 0) {
    return { id: 'NONE' } // No access
  }

  return {
    id: { in: accessibleIds }
  }
}

/**
 * Get mapels that user can access/edit
 */
export function getAccessibleMapelIds(user: UserWithProfile): string[] {
  if (isAdmin(user)) return []
  
  if (user.ustadzProfile) {
    return user.ustadzProfile.mapels.map(m => m.id)
  }

  return []
}

/**
 * Get halaqoh that user can access/edit
 */
export function getAccessibleHalaqohIds(user: UserWithProfile): string[] {
  if (isAdmin(user)) return []
  
  if (user.ustadzProfile) {
    return user.ustadzProfile.halqohs.map(h => h.id)
  }

  return []
}

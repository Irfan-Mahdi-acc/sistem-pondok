'use server'

import { prisma } from '@/lib/prisma'
import { decrypt } from '@/lib/encryption'
import { parseRoles } from '@/lib/role-utils'

/**
 * Get all instructors (Ustadz, Musyrif, Pengurus) for dropdowns in Halqoh and Mapel
 * This combines all profiles that can teach/lead
 */
export async function getAllInstructors() {
  const allProfiles = await prisma.ustadzProfile.findMany({
    include: {
      user: true,
    },
    orderBy: { user: { name: 'asc' } }
  })

  // Filter to only show users with USTADZ, MUSYRIF, or PENGURUS role
  const instructors = allProfiles.filter(profile => {
    if (!profile.user) return false
    const rolesArray = parseRoles(profile.user.roles) || [profile.user.role]
    return rolesArray.some((role: string) => ['USTADZ', 'MUSYRIF', 'PENGURUS'].includes(role))
  })

  // Decrypt sensitive fields
  return instructors.map(instructor => ({
    ...instructor,
    nik: instructor.nik ? decrypt(instructor.nik) : null,
    phone: instructor.phone ? decrypt(instructor.phone) : null,
    address: instructor.address ? decrypt(instructor.address) : null,
  }))
}

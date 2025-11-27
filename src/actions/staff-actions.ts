'use server'

import { prisma } from "@/lib/prisma"
import { decrypt } from "@/lib/encryption"

export async function getAllStaff() {
  const staff = await prisma.ustadzProfile.findMany({
    where: {
      user: {
        role: { in: ['USTADZ', 'PENGURUS', 'MUSYRIF'] }
      }
    },
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

  return staff.map(s => ({
    ...s,
    nik: s.nik ? decrypt(s.nik) : null,
    phone: s.phone ? decrypt(s.phone) : null
  }))
}

'use server'

import { prisma } from "@/lib/prisma"

export async function getFilteredSantri(filters: {
  search?: string
  lembagaId?: string
  kelasId?: string
  status?: string
  gender?: string
}) {
  const where: any = {}

  if (filters.search) {
    where.OR = [
      { nama: { contains: filters.search, mode: 'insensitive' } },
      { nis: { contains: filters.search } },
      { nisn: { contains: filters.search } },
    ]
  }

  if (filters.lembagaId) {
    where.lembagaId = filters.lembagaId
  }

  if (filters.kelasId) {
    where.kelasId = filters.kelasId
  }

  if (filters.status) {
    where.status = filters.status
  }

  if (filters.gender) {
    where.gender = filters.gender
  }

  return await prisma.santri.findMany({
    where,
    include: {
      lembaga: true,
      kelas: true,
      asrama: true,
    },
    orderBy: { nama: 'asc' }
  })
}

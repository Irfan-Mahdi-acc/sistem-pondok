'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getCurrentUserWithProfile, getLembagaAccessFilter } from "@/lib/permissions"

const LembagaSchema = z.object({
  name: z.string().min(3),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  logoUrl: z.string().optional().or(z.literal('')).or(z.null()),
  tags: z.string().optional(),
})

export async function getLembagas() {
  try {
    const user = await getCurrentUserWithProfile()
    console.log('getLembagas user:', user?.id, user?.role)
    
    if (!user) {
      console.log('getLembagas: No user found')
      return []
    }

    const accessFilter = getLembagaAccessFilter(user)
    console.log('getLembagas filter:', JSON.stringify(accessFilter))

    const lembagas = await prisma.lembaga.findMany({
      where: accessFilter,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { santris: true, kelas: true }
        }
      }
    })
    
    console.log('getLembagas count:', lembagas.length)
    return lembagas
  } catch (error) {
    console.error('getLembagas error:', error)
    return []
  }
}

export async function getLembagaById(id: string) {
  return await prisma.lembaga.findUnique({
    where: { id },
    include: {
      mudir: {
        include: {
          user: true
        }
      },
      _count: {
        select: { santris: true, kelas: true }
      }
    }
  })
}

export async function createLembaga(formData: FormData) {
  const rawData = {
    name: formData.get('name') as string,
    address: formData.get('address') as string | null,
    phone: formData.get('phone') as string | null,
    email: formData.get('email') as string | null,
    logoUrl: formData.get('logoUrl') as string | null,
    jenjang: formData.get('jenjang') as string | null,
    tags: formData.get('tags') as string | null,
  }

  const validatedData = LembagaSchema.safeParse(rawData)

  if (!validatedData.success) {
    console.error('Validation error:', validatedData.error)
    const formattedErrors = validatedData.error.format()
    console.error('Formatted errors:', formattedErrors)
    return { success: false, error: JSON.stringify(formattedErrors) }
  }

  try {
    await prisma.lembaga.create({
      data: {
        name: validatedData.data.name,
        address: validatedData.data.address || null,
        phone: validatedData.data.phone || null,
        email: validatedData.data.email || null,
        logoUrl: validatedData.data.logoUrl || null,
        tags: validatedData.data.tags || null,
      },
    })
    revalidatePath('/dashboard/lembaga')
    return { success: true }
  } catch (error) {
    console.error('Database error creating lembaga:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    const errorMessage = error instanceof Error ? error.message : 'Failed to create lembaga'
    return { success: false, error: errorMessage }
  }
}

export async function updateLembaga(id: string, formData: FormData) {
  const rawData = {
    name: formData.get('name') as string,
    address: formData.get('address') as string | null,
    phone: formData.get('phone') as string | null,
    email: formData.get('email') as string | null,
    logoUrl: formData.get('logoUrl') as string | null,
    jenjang: formData.get('jenjang') as string | null,
    tags: formData.get('tags') as string | null,
  }

  const validatedData = LembagaSchema.safeParse(rawData)

  if (!validatedData.success) {
    return { success: false, error: validatedData.error.flatten() }
  }

  try {
    await prisma.lembaga.update({
      where: { id },
      data: {
        name: validatedData.data.name,
        address: validatedData.data.address || null,
        phone: validatedData.data.phone || null,
        email: validatedData.data.email || null,
        logoUrl: validatedData.data.logoUrl || null,
        tags: validatedData.data.tags || null,
      },
    })
    revalidatePath('/dashboard/lembaga')
    return { success: true }
  } catch (error) {
    console.error('Database error updating lembaga:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to update lembaga'
    return { success: false, error: errorMessage }
  }
}

export async function updateMudir(lembagaId: string, ustadzId: string | null) {
  try {
    await prisma.lembaga.update({
      where: { id: lembagaId },
      data: { mudirId: ustadzId }
    })
    revalidatePath(`/dashboard/lembaga/${lembagaId}`)
    revalidatePath('/dashboard/lembaga')
    return { success: true }
  } catch (error) {
    console.error('Update mudir error:', error)
    return { success: false, error: 'Failed to update mudir' }
  }
}

export async function deleteLembaga(id: string, password: string) {
  // Verify password
  if (password !== 'Ketanggung05') {
    return { success: false, error: 'Password salah!' }
  }

  try {
    // Delete all related records in transaction
    await prisma.$transaction(async (tx) => {
      // Get all kelas in this lembaga
      const kelasList = await tx.kelas.findMany({
        where: { lembagaId: id },
        select: { id: true }
      })
      const kelasIds = kelasList.map(k => k.id)

      // Get all santri in this lembaga
      const santriList = await tx.santri.findMany({
        where: { lembagaId: id },
        select: { id: true }
      })
      const santriIds = santriList.map(s => s.id)

      // Delete all santri-related data
      if (santriIds.length > 0) {
        await tx.kelasHistory.deleteMany({
          where: { santriId: { in: santriIds } }
        })
        await tx.tahfidz.deleteMany({
          where: { santriId: { in: santriIds } }
        })
        await tx.violationRecord.deleteMany({
          where: { santriId: { in: santriIds } }
        })
        await tx.billing.deleteMany({
          where: { santriId: { in: santriIds } }
        })
        await tx.tagihan.deleteMany({
          where: { santriId: { in: santriIds } }
        })
        await tx.nilai.deleteMany({
          where: { santriId: { in: santriIds } }
        })
        // Delete all santri
        await tx.santri.deleteMany({
          where: { id: { in: santriIds } }
        })
      }

      // Delete kelas-related data
      if (kelasIds.length > 0) {
        await tx.kelasHistory.deleteMany({
          where: { kelasId: { in: kelasIds } }
        })
        await tx.jadwalPelajaran.deleteMany({
          where: { kelasId: { in: kelasIds } }
        })
        await tx.mapel.deleteMany({
          where: { kelasId: { in: kelasIds } }
        })
        // Delete all kelas
        await tx.kelas.deleteMany({
          where: { id: { in: kelasIds } }
        })
      }

      // Finally delete the lembaga
      await tx.lembaga.delete({
        where: { id }
      })
    })

    revalidatePath('/dashboard/lembaga')
    return { success: true }
  } catch (error) {
    console.error('Delete lembaga error:', error)
    return { 
      success: false, 
      error: 'Gagal menghapus lembaga: ' + (error instanceof Error ? error.message : 'Unknown error') 
    }
  }
}

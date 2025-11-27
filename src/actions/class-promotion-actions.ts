'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// Get all classes with their next class mapping and santri count
export async function getClassesForPromotion(lembagaId?: string) {
  return await prisma.kelas.findMany({
    where: lembagaId ? { lembagaId } : {},
    include: {
      lembaga: true,
      nextKelas: {
        include: {
          lembaga: true
        }
      },
      santris: {
        where: { status: 'ACTIVE' },
        select: {
          id: true,
          nis: true,
          nama: true,
          status: true
        },
        orderBy: { nama: 'asc' }
      },
      _count: {
        select: { santris: true }
      }
    },
    orderBy: [
      { lembaga: { name: 'asc' } },
      { name: 'asc' }
    ]
  })
}

// Get promotion preview - see which students will be promoted to which class
export async function getPromotionPreview(academicYear: string, lembagaId?: string) {
  const classes = await getClassesForPromotion(lembagaId)
  
  const preview = classes.map(kelas => ({
    kelasId: kelas.id,
    kelasName: kelas.name,
    lembagaName: kelas.lembaga.name,
    currentCount: kelas.santris.length,
    nextKelasId: kelas.nextKelasId,
    nextKelasName: kelas.nextKelas?.name || null,
    nextKelasLembaga: kelas.nextKelas?.lembaga?.name || null,
    santris: kelas.santris,
    // Classes without nextKelas are terminal (graduation)
    isTerminal: !kelas.nextKelasId
  }))

  return preview
}

// Perform bulk class promotion
export async function performClassPromotion(
  academicYear: string,
  promotionData: {
    santriId: string
    fromKelasId: string
    toKelasId: string | null // null means graduated
    status: 'NAIK' | 'LULUS' | 'TINGGAL' | 'PINDAH' | 'KELUAR'
  }[]
) {
  try {
    const results = {
      promoted: 0,
      graduated: 0,
      retained: 0,
      errors: [] as string[]
    }

    for (const promotion of promotionData) {
      try {
        // Create history record
        await prisma.kelasHistory.create({
          data: {
            santriId: promotion.santriId,
            kelasId: promotion.fromKelasId,
            academicYear: academicYear,
            status: promotion.status,
            endDate: new Date()
          }
        })

        // Update santri's current class
        if (promotion.status === 'NAIK' && promotion.toKelasId) {
          // Promote to next class
          await prisma.santri.update({
            where: { id: promotion.santriId },
            data: { kelasId: promotion.toKelasId }
          })
          results.promoted++
        } else if (promotion.status === 'LULUS') {
          // Graduate - remove from class and update status
          await prisma.santri.update({
            where: { id: promotion.santriId },
            data: { 
              kelasId: null,
              status: 'ALUMNI'
            }
          })
          results.graduated++
        } else if (promotion.status === 'TINGGAL') {
          // Stay in same class - just record history, don't change class
          results.retained++
        } else if (promotion.status === 'KELUAR' || promotion.status === 'PINDAH') {
          // Left/transferred - update status
          await prisma.santri.update({
            where: { id: promotion.santriId },
            data: { 
              status: promotion.status === 'KELUAR' ? 'KELUAR' : 'PINDAH'
            }
          })
        }
      } catch (error) {
        results.errors.push(`Error processing santri ${promotion.santriId}: ${error}`)
      }
    }

    revalidatePath('/dashboard/santri')
    revalidatePath('/dashboard/academic/kenaikan-kelas')
    revalidatePath('/dashboard/kelas')

    return { 
      success: true, 
      results 
    }
  } catch (error) {
    console.error('Class promotion error:', error)
    return { 
      success: false, 
      error: 'Gagal melakukan kenaikan kelas' 
    }
  }
}

// Get promotion history for a specific academic year
export async function getPromotionHistory(academicYear: string) {
  return await prisma.kelasHistory.findMany({
    where: { academicYear },
    include: {
      santri: {
        select: {
          id: true,
          nis: true,
          nama: true
        }
      },
      kelas: {
        include: {
          lembaga: true
        }
      }
    },
    orderBy: { startDate: 'desc' }
  })
}

// Quick promote all students in a class to their next class
export async function promoteEntireClass(
  kelasId: string, 
  academicYear: string,
  excludeSantriIds: string[] = []
) {
  try {
    const kelas = await prisma.kelas.findUnique({
      where: { id: kelasId },
      include: {
        santris: {
          where: { 
            status: 'ACTIVE',
            id: { notIn: excludeSantriIds }
          }
        },
        nextKelas: true
      }
    })

    if (!kelas) {
      return { success: false, error: 'Kelas tidak ditemukan' }
    }

    const promotionData = kelas.santris.map(santri => ({
      santriId: santri.id,
      fromKelasId: kelasId,
      toKelasId: kelas.nextKelasId,
      status: kelas.nextKelasId ? 'NAIK' as const : 'LULUS' as const
    }))

    return await performClassPromotion(academicYear, promotionData)
  } catch (error) {
    console.error('Promote entire class error:', error)
    return { success: false, error: 'Gagal menaikkan seluruh kelas' }
  }
}

// Get students who haven't been processed for the academic year
export async function getUnprocessedStudents(academicYear: string, lembagaId?: string) {
  // Get all santri IDs that have been processed in this academic year
  const processedHistory = await prisma.kelasHistory.findMany({
    where: { academicYear },
    select: { santriId: true }
  })
  const processedIds = processedHistory.map(h => h.santriId)

  // Get active students not yet processed
  return await prisma.santri.findMany({
    where: {
      status: 'ACTIVE',
      id: { notIn: processedIds },
      ...(lembagaId && { lembagaId })
    },
    include: {
      kelas: {
        include: {
          lembaga: true,
          nextKelas: true
        }
      },
      lembaga: true
    },
    orderBy: [
      { lembaga: { name: 'asc' } },
      { kelas: { name: 'asc' } },
      { nama: 'asc' }
    ]
  })
}

// Undo promotion for a specific history record
export async function undoPromotion(historyId: string) {
  try {
    const history = await prisma.kelasHistory.findUnique({
      where: { id: historyId },
      include: { santri: true }
    })

    if (!history) {
      return { success: false, error: 'Riwayat tidak ditemukan' }
    }

    // Restore santri to original class
    await prisma.santri.update({
      where: { id: history.santriId },
      data: {
        kelasId: history.kelasId,
        status: 'ACTIVE'
      }
    })

    // Delete history record
    await prisma.kelasHistory.delete({
      where: { id: historyId }
    })

    revalidatePath('/dashboard/santri')
    revalidatePath('/dashboard/academic/kenaikan-kelas')

    return { success: true }
  } catch (error) {
    console.error('Undo promotion error:', error)
    return { success: false, error: 'Gagal membatalkan kenaikan kelas' }
  }
}


'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

// Get all bookkeepings with access control
export async function getBookkeepings() {
  const session = await auth()
  if (!session?.user) return []

  const userId = session.user.id
  const userRole = session.user.role

  // Super Admin & Bendahara can see all
  if (userRole === 'SUPER_ADMIN' || userRole === 'BENDAHARA') {
    return await prisma.bookkeeping.findMany({
      include: {
        lembaga: {
          select: { id: true, name: true }
        },
        assignments: {
          include: {
            user: {
              select: { id: true, name: true, username: true }
            }
          }
        },
        _count: {
          select: { transactions: true, assignments: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  // Pengurus: only assigned bookkeepings
  return await prisma.bookkeeping.findMany({
    where: {
      assignments: {
        some: {
          userId: userId
        }
      }
    },
    include: {
      lembaga: {
        select: { id: true, name: true }
      },
      assignments: {
        include: {
          user: {
            select: { id: true, name: true, username: true }
          }
        }
      },
      _count: {
        select: { transactions: true, assignments: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

// Get bookkeeping by ID with permission check
export async function getBookkeepingById(id: string) {
  const session = await auth()
  if (!session?.user) return null

  const userId = session.user.id
  const userRole = session.user.role

  const bookkeeping = await prisma.bookkeeping.findUnique({
    where: { id },
    include: {
      lembaga: {
        select: { id: true, name: true }
      },
      assignments: {
        include: {
          user: {
            select: { id: true, name: true, username: true, role: true }
          }
        }
      },
      transactions: {
        include: {
          category: true
        },
        orderBy: { date: 'desc' },
        take: 50
      }
    }
  })

  if (!bookkeeping) return null

  // Permission check
  if (userRole !== 'SUPER_ADMIN' && userRole !== 'BENDAHARA') {
    const hasAccess = bookkeeping.assignments.some(a => a.userId === userId)
    if (!hasAccess) return null
  }

  return bookkeeping
}

// Create new bookkeeping
export async function createBookkeeping(formData: FormData) {
  const session = await auth()
  if (!session?.user) return { success: false, error: 'Unauthorized' }

  // Only SUPER_ADMIN and BENDAHARA can create
  if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'BENDAHARA') {
    return { success: false, error: 'Tidak memiliki izin' }
  }

  try {
    const type = formData.get('type') as string
    const lembagaId = type === 'LEMBAGA' ? formData.get('lembagaId') as string : null

    const bookkeeping = await prisma.bookkeeping.create({
      data: {
        name: formData.get('name') as string,
        type,
        lembagaId,
        description: formData.get('description') as string || null,
        createdBy: session.user.id,
        status: 'ACTIVE',
      }
    })

    revalidatePath('/dashboard/finance/bookkeeping-management')
    return { success: true, data: bookkeeping }
  } catch (error) {
    console.error('Create bookkeeping error:', error)
    return { success: false, error: 'Gagal membuat pembukuan' }
  }
}

// Update bookkeeping
export async function updateBookkeeping(id: string, formData: FormData) {
  const session = await auth()
  if (!session?.user) return { success: false, error: 'Unauthorized' }

  if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'BENDAHARA') {
    return { success: false, error: 'Tidak memiliki izin' }
  }

  try {
    await prisma.bookkeeping.update({
      where: { id },
      data: {
        name: formData.get('name') as string,
        description: formData.get('description') as string || null,
        status: formData.get('status') as string,
      }
    })

    revalidatePath('/dashboard/finance/bookkeeping-management')
    revalidatePath(`/dashboard/finance/bookkeeping/${id}`)
    return { success: true }
  } catch (error) {
    console.error('Update bookkeeping error:', error)
    return { success: false, error: 'Gagal mengupdate pembukuan' }
  }
}

// Delete bookkeeping
export async function deleteBookkeeping(id: string) {
  const session = await auth()
  if (!session?.user) return { success: false, error: 'Unauthorized' }

  if (session.user.role !== 'SUPER_ADMIN') {
    return { success: false, error: 'Hanya Super Admin yang dapat menghapus' }
  }

  try {
    await prisma.bookkeeping.delete({
      where: { id }
    })

    revalidatePath('/dashboard/finance/bookkeeping-management')
    return { success: true }
  } catch (error) {
    console.error('Delete bookkeeping error:', error)
    return { success: false, error: 'Gagal menghapus pembukuan' }
  }
}

// Assign user to bookkeeping
export async function assignUserToBookkeeping(
  bookkeepingId: string,
  userId: string,
  role: 'MANAGER' | 'EDITOR' | 'VIEWER'
) {
  const session = await auth()
  if (!session?.user) return { success: false, error: 'Unauthorized' }

  if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'BENDAHARA') {
    return { success: false, error: 'Tidak memiliki izin' }
  }

  try {
    await prisma.bookkeepingAssignment.create({
      data: {
        bookkeepingId,
        userId,
        role,
        assignedBy: session.user.id,
      }
    })

    revalidatePath('/dashboard/finance/bookkeeping-management')
    revalidatePath(`/dashboard/finance/bookkeeping/${bookkeepingId}`)
    return { success: true }
  } catch (error) {
    console.error('Assign user error:', error)
    return { success: false, error: 'Gagal menambahkan pengurus' }
  }
}

// Remove user from bookkeeping
export async function removeUserFromBookkeeping(assignmentId: string) {
  const session = await auth()
  if (!session?.user) return { success: false, error: 'Unauthorized' }

  if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'BENDAHARA') {
    return { success: false, error: 'Tidak memiliki izin' }
  }

  try {
    await prisma.bookkeepingAssignment.delete({
      where: { id: assignmentId }
    })

    revalidatePath('/dashboard/finance/bookkeeping-management')
    return { success: true }
  } catch (error) {
    console.error('Remove assignment error:', error)
    return { success: false, error: 'Gagal menghapus assignment' }
  }
}

// Get available users for assignment
export async function getAvailableUsersForBookkeeping() {
  return await prisma.user.findMany({
    where: {
      OR: [
        { role: 'SUPER_ADMIN' },
        { role: 'ADMIN' },
        { role: 'BENDAHARA' },
        { role: 'PENGURUS' },
        { role: 'MUDIR' },
        { role: 'USTADZ' },
        { role: 'ADMIN_KANTOR' }
      ]
    },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
    },
    orderBy: { name: 'asc' }
  })
}

// Get bookkeeping stats
export async function getBookkeepingStats() {
  const session = await auth()
  if (!session?.user) return null

  const userId = session.user.id
  const userRole = session.user.role

  if (userRole === 'SUPER_ADMIN' || userRole === 'BENDAHARA') {
    const [total, umum, lembaga, custom, active] = await Promise.all([
      prisma.bookkeeping.count(),
      prisma.bookkeeping.count({ where: { type: 'UMUM' } }),
      prisma.bookkeeping.count({ where: { type: 'LEMBAGA' } }),
      prisma.bookkeeping.count({ where: { type: 'CUSTOM' } }),
      prisma.bookkeeping.count({ where: { status: 'ACTIVE' } }),
    ])

    return { total, umum, lembaga, custom, active }
  }

  // Pengurus: count only assigned bookkeepings
  const total = await prisma.bookkeeping.count({
    where: {
      assignments: {
        some: { userId }
      }
    }
  })

  return { total, umum: 0, lembaga: 0, custom: 0, active: total }
}


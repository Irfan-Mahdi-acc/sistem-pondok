'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const AsramaSchema = z.object({
  name: z.string().min(1),
  capacity: z.coerce.number().min(1),
  gender: z.enum(['L', 'P']),
  address: z.preprocess(
    (val) => (val === '' || val === undefined || val === null) ? null : val,
    z.string().nullable()
  ),
})

export async function getAsramaList() {
  return await prisma.asrama.findMany({
    include: {
      _count: {
        select: { santris: true }
      }
    },
    orderBy: { name: 'asc' }
  })
}

export async function getAsramaById(id: string) {
  return await prisma.asrama.findUnique({
    where: { id },
    include: {
      ketuaAsrama: {
        select: {
          id: true,
          nis: true,
          nama: true,
        }
      },
      musyrif: {
        select: {
          id: true,
          nik: true,
          user: {
            select: {
              name: true,
            }
          }
        }
      },
      santris: {
        include: {
          lembaga: true,
          kelas: true
        },
        orderBy: { nama: 'asc' }
      }
    }
  })
}

export async function updateKetuaAsrama(asramaId: string, santriId: string | null) {
  try {
    await prisma.asrama.update({
      where: { id: asramaId },
      data: {
        ketuaAsramaId: santriId
      }
    })
    
    revalidatePath('/dashboard/asrama')
    revalidatePath(`/dashboard/asrama/${asramaId}`)
    return { success: true }
  } catch (error) {
    console.error('Database error:', error)
    return { success: false, error: 'Failed to update ketua asrama' }
  }
}

export async function updateMusyrif(asramaId: string, ustadzId: string | null) {
  try {
    await prisma.asrama.update({
      where: { id: asramaId },
      data: {
        musyrifId: ustadzId
      }
    })
    
    revalidatePath('/dashboard/asrama')
    revalidatePath(`/dashboard/asrama/${asramaId}`)
    return { success: true }
  } catch (error) {
    console.error('Database error:', error)
    return { success: false, error: 'Failed to update musyrif' }
  }
}

export async function addSantriToAsrama(santriId: string, asramaId: string) {
  try {
    await prisma.santri.update({
      where: { id: santriId },
      data: {
        asramaId: asramaId
      }
    })
    
    revalidatePath('/dashboard/asrama')
    revalidatePath(`/dashboard/asrama/${asramaId}`)
    revalidatePath('/dashboard/santri')
    return { success: true }
  } catch (error) {
    console.error('Database error:', error)
    return { success: false, error: 'Failed to add santri to asrama' }
  }
}

export async function removeSantriFromAsrama(santriId: string) {
  try {
    await prisma.santri.update({
      where: { id: santriId },
      data: {
        asramaId: null
      }
    })
    
    revalidatePath('/dashboard/asrama')
    revalidatePath('/dashboard/santri')
    return { success: true }
  } catch (error) {
    console.error('Database error:', error)
    return { success: false, error: 'Failed to remove santri from asrama' }
  }
}

export async function createAsrama(formData: FormData) {
  const rawData = {
    name: formData.get('name') as string,
    capacity: formData.get('capacity') as string,
    gender: formData.get('gender') as string,
    address: (formData.get('address') as string) || null,
  }

  const validatedData = AsramaSchema.safeParse(rawData)

  if (!validatedData.success) {
    console.error('Validation error:', validatedData.error.flatten())
    return { success: false, error: validatedData.error.flatten() }
  }

  try {
    await prisma.asrama.create({
      data: {
        name: validatedData.data.name,
        capacity: validatedData.data.capacity,
        gender: validatedData.data.gender,
        address: validatedData.data.address || null,
      },
    })
    
    revalidatePath('/dashboard/asrama')
    return { success: true }
  } catch (error) {
    console.error('Database error:', error)
    return { success: false, error: 'Failed to create asrama' }
  }
}

export async function updateAsrama(id: string, formData: FormData) {
  const rawData = {
    name: formData.get('name') as string,
    capacity: formData.get('capacity') as string,
    gender: formData.get('gender') as string,
    address: (formData.get('address') as string) || null,
  }

  const validatedData = AsramaSchema.safeParse(rawData)

  if (!validatedData.success) {
    return { success: false, error: validatedData.error.flatten() }
  }

  try {
    await prisma.asrama.update({
      where: { id },
      data: {
        name: validatedData.data.name,
        capacity: validatedData.data.capacity,
        gender: validatedData.data.gender,
        address: validatedData.data.address || null,
      },
    })
    
    revalidatePath('/dashboard/asrama')
    return { success: true }
  } catch (error) {
    console.error('Database error:', error)
    return { success: false, error: 'Failed to update asrama' }
  }
}

export async function deleteAsrama(id: string) {
  try {
    await prisma.asrama.delete({
      where: { id },
    })
    
    revalidatePath('/dashboard/asrama')
    return { success: true }
  } catch (error) {
    console.error('Database error:', error)
    return { success: false, error: 'Failed to delete asrama' }
  }
}

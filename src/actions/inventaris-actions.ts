'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getAssets() {
  return await prisma.asset.findMany({
    include: {
      maintenanceLogs: {
        orderBy: { date: 'desc' },
        take: 5
      },
      _count: {
        select: { maintenanceLogs: true }
      }
    },
    orderBy: { name: 'asc' }
  })
}

export async function getAssetById(id: string) {
  return await prisma.asset.findUnique({
    where: { id },
    include: {
      maintenanceLogs: {
        orderBy: { date: 'desc' }
      }
    }
  })
}

export async function createAsset(formData: FormData) {
  try {
    const data = {
      name: formData.get('name') as string,
      code: formData.get('code') as string || null,
      category: formData.get('category') as string,
      condition: formData.get('condition') as string,
      location: formData.get('location') as string || null,
      purchaseDate: formData.get('purchaseDate') 
        ? new Date(formData.get('purchaseDate') as string)
        : null,
      price: formData.get('price') 
        ? parseFloat(formData.get('price') as string)
        : null,
    }

    await prisma.asset.create({ data })
    revalidatePath('/dashboard/kantor/inventaris')
    return { success: true }
  } catch (error) {
    console.error('Create asset error:', error)
    return { success: false, error: 'Gagal menambah aset' }
  }
}

export async function updateAsset(id: string, formData: FormData) {
  try {
    const data = {
      name: formData.get('name') as string,
      code: formData.get('code') as string || null,
      category: formData.get('category') as string,
      condition: formData.get('condition') as string,
      location: formData.get('location') as string || null,
      purchaseDate: formData.get('purchaseDate') 
        ? new Date(formData.get('purchaseDate') as string)
        : null,
      price: formData.get('price') 
        ? parseFloat(formData.get('price') as string)
        : null,
    }

    await prisma.asset.update({
      where: { id },
      data
    })
    
    revalidatePath('/dashboard/kantor/inventaris')
    return { success: true }
  } catch (error) {
    console.error('Update asset error:', error)
    return { success: false, error: 'Gagal mengupdate aset' }
  }
}

export async function deleteAsset(id: string) {
  try {
    await prisma.asset.delete({
      where: { id }
    })
    revalidatePath('/dashboard/kantor/inventaris')
    return { success: true }
  } catch (error) {
    console.error('Delete asset error:', error)
    return { success: false, error: 'Gagal menghapus aset' }
  }
}

export async function addMaintenanceLog(formData: FormData) {
  try {
    const data = {
      assetId: formData.get('assetId') as string,
      date: formData.get('date') 
        ? new Date(formData.get('date') as string)
        : new Date(),
      description: formData.get('description') as string,
      cost: formData.get('cost') 
        ? parseFloat(formData.get('cost') as string)
        : null,
      performer: formData.get('performer') as string || null,
    }

    await prisma.maintenanceLog.create({ data })
    revalidatePath('/dashboard/kantor/inventaris')
    return { success: true }
  } catch (error) {
    console.error('Add maintenance log error:', error)
    return { success: false, error: 'Gagal menambah log pemeliharaan' }
  }
}

export async function getAssetStats() {
  const assets = await prisma.asset.findMany()
  
  return {
    total: assets.length,
    good: assets.filter(a => a.condition === 'GOOD').length,
    damaged: assets.filter(a => a.condition === 'DAMAGED').length,
    lost: assets.filter(a => a.condition === 'LOST').length,
  }
}



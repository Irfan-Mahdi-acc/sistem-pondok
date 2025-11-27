'use server'

import { prisma } from '@/lib/prisma'

export type DataType = 'santri' | 'kelas' | 'ustadz' | 'jadwal'

/**
 * Update sync metadata when data changes
 * Call this after any create/update/delete operation
 */
export async function updateSyncMetadata(dataType: DataType): Promise<void> {
  try {
    // Count current records
    let recordCount = 0
    
    switch (dataType) {
      case 'santri':
        recordCount = await prisma.santri.count()
        break
      case 'kelas':
        recordCount = await prisma.kelas.count()
        break
      case 'ustadz':
        // TODO: Add Ustadz model to schema
        recordCount = 0
        break
      case 'jadwal':
        // TODO: Add Jadwal model to schema
        recordCount = 0
        break
    }

    // Update or create sync metadata
    await prisma.syncMetadata.upsert({
      where: { dataType },
      update: {
        lastModified: new Date(),
        recordCount
      },
      create: {
        dataType,
        lastModified: new Date(),
        recordCount
      }
    })
  } catch (error) {
    console.error(`Update sync metadata for ${dataType} error:`, error)
    // Don't throw - sync metadata update should not break main operations
  }
}

/**
 * Initialize sync metadata for all data types
 * Run this once during setup
 */
export async function initializeSyncMetadata(): Promise<void> {
  try {
    const dataTypes: DataType[] = ['santri', 'kelas', 'ustadz', 'jadwal']
    
    for (const type of dataTypes) {
      await updateSyncMetadata(type)
    }
  } catch (error) {
    console.error('Initialize sync metadata error:', error)
  }
}

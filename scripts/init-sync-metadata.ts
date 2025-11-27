/**
 * Initialize Sync Metadata
 * Run this script once to populate initial sync metadata
 * 
 * Usage: npx tsx scripts/init-sync-metadata.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Initializing sync metadata...')

  const dataTypes = ['santri', 'kelas', 'ustadz', 'jadwal'] as const

  for (const dataType of dataTypes) {
    try {
      // Count records
      let recordCount = 0
      
      switch (dataType) {
        case 'santri':
          recordCount = await prisma.santri.count()
          break
        case 'kelas':
          recordCount = await prisma.kelas.count()
          break
        case 'ustadz':
          recordCount = await prisma.ustadz.count()
          break
        case 'jadwal':
          recordCount = await prisma.jadwal.count()
          break
      }

      // Upsert sync metadata
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

      console.log(`✅ ${dataType}: ${recordCount} records`)
    } catch (error) {
      console.error(`❌ Error initializing ${dataType}:`, error)
    }
  }

  console.log('✨ Sync metadata initialized!')
}

main()
  .catch((e) => {
    console.error('Fatal error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

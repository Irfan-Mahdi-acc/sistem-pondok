/**
 * Migration Script: Encrypt Existing Sensitive Data
 * 
 * This script encrypts all existing plaintext sensitive data in the database.
 * Run this ONCE after setting ENCRYPTION_KEY in .env.local
 * 
 * Usage:
 *   npx tsx scripts/encrypt-existing-data.ts
 */

import { PrismaClient } from '@prisma/client'
import { encrypt } from '../src/lib/encryption'

const prisma = new PrismaClient()

async function main() {
  console.log('🔐 Starting data encryption migration...\n')

  // Encrypt Santri data
  console.log('📚 Encrypting Santri data...')
  const santriList = await prisma.santri.findMany()
  
  let santriCount = 0
  for (const santri of santriList) {
    const updates: any = {}
    
    // Only encrypt if data exists and is not already encrypted
    if (santri.nikNumber && !santri.nikNumber.startsWith('U2Fsd')) {
      updates.nikNumber = encrypt(santri.nikNumber)
    }
    if (santri.phone && !santri.phone.startsWith('U2Fsd')) {
      updates.phone = encrypt(santri.phone)
    }
    if (santri.address && !santri.address.startsWith('U2Fsd')) {
      updates.address = encrypt(santri.address)
    }
    if (santri.fatherNik && !santri.fatherNik.startsWith('U2Fsd')) {
      updates.fatherNik = encrypt(santri.fatherNik)
    }
    if (santri.fatherPhone && !santri.fatherPhone.startsWith('U2Fsd')) {
      updates.fatherPhone = encrypt(santri.fatherPhone)
    }
    if (santri.motherNik && !santri.motherNik.startsWith('U2Fsd')) {
      updates.motherNik = encrypt(santri.motherNik)
    }
    if (santri.motherPhone && !santri.motherPhone.startsWith('U2Fsd')) {
      updates.motherPhone = encrypt(santri.motherPhone)
    }
    if (santri.waliNik && !santri.waliNik.startsWith('U2Fsd')) {
      updates.waliNik = encrypt(santri.waliNik)
    }
    if (santri.waliPhone && !santri.waliPhone.startsWith('U2Fsd')) {
      updates.waliPhone = encrypt(santri.waliPhone)
    }
    
    if (Object.keys(updates).length > 0) {
      await prisma.santri.update({
        where: { id: santri.id },
        data: updates
      })
      santriCount++
    }
  }
  console.log(`✅ Encrypted ${santriCount} santri records\n`)

  // Encrypt Ustadz data
  console.log('👨‍🏫 Encrypting Ustadz data...')
  const ustadzList = await prisma.ustadzProfile.findMany()
  
  let ustadzCount = 0
  for (const ustadz of ustadzList) {
    const updates: any = {}
    
    // Only encrypt if data exists and is not already encrypted
    if (ustadz.nik && !ustadz.nik.startsWith('U2Fsd')) {
      updates.nik = encrypt(ustadz.nik)
    }
    if (ustadz.phone && !ustadz.phone.startsWith('U2Fsd')) {
      updates.phone = encrypt(ustadz.phone)
    }
    if (ustadz.address && !ustadz.address.startsWith('U2Fsd')) {
      updates.address = encrypt(ustadz.address)
    }
    
    if (Object.keys(updates).length > 0) {
      await prisma.ustadzProfile.update({
        where: { id: ustadz.id },
        data: updates
      })
      ustadzCount++
    }
  }
  console.log(`✅ Encrypted ${ustadzCount} ustadz records\n`)

  console.log('🎉 Migration completed successfully!')
  console.log(`📊 Total encrypted: ${santriCount + ustadzCount} records`)
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

// Migration script for bookkeeping system
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateBookkeeping() {
  console.log('🚀 Starting Bookkeeping migration...\n')

  try {
    // Create tables
    console.log('📝 Creating Bookkeeping tables...')
    
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Bookkeeping" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "lembagaId" TEXT,
        "description" TEXT,
        "status" TEXT NOT NULL DEFAULT 'ACTIVE',
        "createdBy" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("lembagaId") REFERENCES "Lembaga"("id") ON DELETE SET NULL
      );
    `)

    console.log('✅ Bookkeeping table created')

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "BookkeepingAssignment" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "bookkeepingId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "role" TEXT NOT NULL,
        "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "assignedBy" TEXT,
        FOREIGN KEY ("bookkeepingId") REFERENCES "Bookkeeping"("id") ON DELETE CASCADE,
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
        UNIQUE("bookkeepingId", "userId")
      );
    `)

    console.log('✅ BookkeepingAssignment table created')

    // Add indexes
    console.log('📝 Creating indexes...')
    
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Bookkeeping_type_idx" ON "Bookkeeping"("type");
    `)
    
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Bookkeeping_lembagaId_idx" ON "Bookkeeping"("lembagaId");
    `)
    
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Bookkeeping_status_idx" ON "Bookkeeping"("status");
    `)
    
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "BookkeepingAssignment_userId_idx" ON "BookkeepingAssignment"("userId");
    `)
    
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "BookkeepingAssignment_bookkeepingId_idx" ON "BookkeepingAssignment"("bookkeepingId");
    `)

    console.log('✅ Indexes created')

    // Add bookkeepingId to Transaction (optional, for backward compatibility)
    console.log('📝 Adding bookkeepingId to Transaction...')
    
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "bookkeepingId" TEXT;
    `)
    
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Transaction_bookkeepingId_idx" ON "Transaction"("bookkeepingId");
    `)
    
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Transaction_date_idx" ON "Transaction"("date");
    `)

    console.log('✅ Transaction updated')

    // Create default Pembukuan Umum
    console.log('📝 Creating default Pembukuan Umum...')
    
    const superAdmin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' }
    })

    if (superAdmin) {
      const defaultBookkeeping = await prisma.$executeRawUnsafe(`
        INSERT INTO "Bookkeeping" (id, name, type, description, status, "createdBy")
        VALUES (gen_random_uuid()::text, 'Pembukuan Umum Pondok', 'UMUM', 'Pembukuan umum untuk seluruh pondok', 'ACTIVE', '${superAdmin.id}')
        ON CONFLICT DO NOTHING;
      `)
      
      console.log('✅ Default Pembukuan Umum created')
    }

    console.log('\n✅ Migration completed successfully!')
    console.log('\n🎯 Next steps:')
    console.log('1. Run: npx prisma generate')
    console.log('2. Restart dev server')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

migrateBookkeeping()
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Error:', error)
    process.exit(1)
  })


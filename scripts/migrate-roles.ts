import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateRoles() {
  console.log('🔄 Starting role migration...')
  
  try {
    // Get all users
    const users = await prisma.user.findMany()
    
    console.log(`Found ${users.length} users to migrate`)
    
    // Migrate each user
    for (const user of users) {
      // Parse existing roles or use single role
      let rolesArray: string[]
      
      try {
        // Try to parse roles field
        rolesArray = user.roles ? JSON.parse(user.roles) : []
      } catch {
        rolesArray = []
      }
      
      // If roles array is empty, use the old role field
      if (rolesArray.length === 0 && user.role) {
        rolesArray = [user.role]
      }
      
      // Update user with roles array as JSON string
      await prisma.user.update({
        where: { id: user.id },
        data: {
          roles: JSON.stringify(rolesArray),
          role: rolesArray[0] || user.role, // Keep first role for backward compatibility
        }
      })
      
      console.log(`✅ Migrated user: ${user.name} - Roles: ${rolesArray.join(', ')}`)
    }
    
    console.log('✨ Migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

migrateRoles()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

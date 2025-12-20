const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createSuperAdmin() {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash('SuperAdmin2024!', 10)
    
    // Check if user with email exists
    const existingByEmail = await prisma.user.findUnique({
      where: { email: 'irfanmahdi.dev@gmail.com' }
    })
    
    // Check if user with username exists
    const existingByUsername = await prisma.user.findUnique({
      where: { username: 'superadmin' }
    })
    
    if (existingByEmail) {
      console.log('User with email exists, updating...')
      const updated = await prisma.user.update({
        where: { email: 'irfanmahdi.dev@gmail.com' },
        data: {
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          roles: JSON.stringify(['SUPER_ADMIN']),
          isApproved: true,
          approvedAt: new Date(),
          name: 'Super Admin'
        }
      })
      console.log('✅ Super Admin updated successfully!')
      console.log('Email:', updated.email)
      console.log('Username:', updated.username)
      console.log('Password: SuperAdmin2024!')
      console.log('Role:', updated.role)
    } else if (existingByUsername) {
      console.log('Username "superadmin" exists, updating with new email...')
      const updated = await prisma.user.update({
        where: { username: 'superadmin' },
        data: {
          email: 'irfanmahdi.dev@gmail.com',
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          roles: JSON.stringify(['SUPER_ADMIN']),
          isApproved: true,
          approvedAt: new Date(),
          name: 'Super Admin'
        }
      })
      console.log('✅ Super Admin updated successfully!')
      console.log('Email:', updated.email)
      console.log('Username:', updated.username)
      console.log('Password: SuperAdmin2024!')
      console.log('Role:', updated.role)
    } else {
      // Create new user
      const user = await prisma.user.create({
        data: {
          email: 'irfanmahdi.dev@gmail.com',
          username: 'irfanmahdi',
          password: hashedPassword,
          name: 'Super Admin',
          role: 'SUPER_ADMIN',
          roles: JSON.stringify(['SUPER_ADMIN']),
          isApproved: true,
          approvedAt: new Date()
        }
      })
      
      console.log('✅ Super Admin created successfully!')
      console.log('Email:', user.email)
      console.log('Username:', user.username)
      console.log('Password: SuperAdmin2024!')
      console.log('Role:', user.role)
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

createSuperAdmin()

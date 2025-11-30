/**
 * Script untuk membuat user baru dengan password yang sudah di-hash
 * 
 * Cara pakai:
 * 1. Edit data user di bawah sesuai kebutuhan
 * 2. Jalankan: npx tsx scripts/create-user.ts
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createUser() {
  try {
    // ========================================
    // EDIT DATA USER DI SINI
    // ========================================
    const userData = {
      username: 'superadmin',      // Username untuk login
      password: 'superadmin123',   // Password (akan di-hash otomatis)
      name: 'Super Administrator', // Nama lengkap
      email: 'superadmin@pondok.com', // Email
      role: 'ADMIN',               // Role: ADMIN, USTADZ, atau MUSYRIF
      isApproved: true,            // Set true agar langsung bisa login
    }

    console.log('🔐 Hashing password...')
    const hashedPassword = await bcrypt.hash(userData.password, 10)

    console.log('👤 Membuat user baru...')
    const user = await prisma.user.create({
      data: {
        username: userData.username,
        password: hashedPassword,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        isApproved: userData.isApproved,
      },
    })

    console.log('✅ User berhasil dibuat!')
    console.log('📋 Detail user:')
    console.log('   - ID:', user.id)
    console.log('   - Username:', user.username)
    console.log('   - Name:', user.name)
    console.log('   - Email:', user.email)
    console.log('   - Role:', user.role)
    console.log('   - Approved:', user.isApproved)
    console.log('')
    console.log('🎉 Sekarang Anda bisa login dengan:')
    console.log('   Username:', userData.username)
    console.log('   Password:', userData.password)

  } catch (error) {
    console.error('❌ Error membuat user:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        console.error('⚠️  Username atau email sudah digunakan!')
      }
    }
  } finally {
    await prisma.$disconnect()
  }
}

createUser()

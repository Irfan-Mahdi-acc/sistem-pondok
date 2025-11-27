import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('SuperAdmin2024!', 10)

  const superAdmin = await prisma.user.upsert({
    where: { username: 'irfanmahdi.dev@gmail.com' },
    update: {
      password,
      name: 'Irfan Mahdi',
      role: 'SUPER_ADMIN',
    },
    create: {
      username: 'irfanmahdi.dev@gmail.com',
      password,
      name: 'Irfan Mahdi',
      role: 'SUPER_ADMIN',
    },
  })

  console.log({ superAdmin })

  // Seed Violation Categories
  const categories = [
    { name: 'Terlambat Sholat', type: 'RINGAN', points: 5, description: 'Terlambat mengikuti sholat berjamaah' },
    { name: 'Tidak Piket', type: 'RINGAN', points: 5, description: 'Tidak melaksanakan tugas piket' },
    { name: 'Berbicara Kotor', type: 'SEDANG', points: 20, description: 'Mengucapkan kata-kata kotor/kasar' },
    { name: 'Berkelahi', type: 'BERAT', points: 50, description: 'Berkelahi dengan sesama santri' },
    { name: 'Merokok', type: 'BERAT', points: 100, description: 'Kedapatan merokok di lingkungan pondok' },
    { name: 'Kabur', type: 'BERAT', points: 100, description: 'Meninggalkan pondok tanpa izin' },
  ]

  for (const cat of categories) {
    await prisma.violationCategory.create({
      data: cat
    })
  }
  console.log('Violation categories seeded')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

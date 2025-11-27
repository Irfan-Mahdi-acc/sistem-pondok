import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const categories = [
  // Income Categories
  { name: 'SPP', type: 'INCOME', description: 'Sumbangan Pembinaan Pendidikan' },
  { name: 'Uang Pangkal', type: 'INCOME', description: 'Uang pangkal santri baru' },
  { name: 'Infaq & Sedekah', type: 'INCOME', description: 'Infaq dan sedekah' },
  { name: 'Donasi', type: 'INCOME', description: 'Donasi dari donatur' },
  { name: 'Hibah', type: 'INCOME', description: 'Hibah dari pemerintah/swasta' },
  { name: 'Zakat', type: 'INCOME', description: 'Penerimaan zakat' },
  { name: 'Pendaftaran', type: 'INCOME', description: 'Biaya pendaftaran santri baru' },
  { name: 'Katering', type: 'INCOME', description: 'Pemasukan dari katering' },
  { name: 'Lain-lain', type: 'INCOME', description: 'Pemasukan lainnya' },
  
  // Expense Categories
  { name: 'Gaji Ustadz', type: 'EXPENSE', description: 'Gaji dan honor ustadz' },
  { name: 'Konsumsi', type: 'EXPENSE', description: 'Biaya konsumsi santri' },
  { name: 'Listrik & Air', type: 'EXPENSE', description: 'Tagihan listrik dan air' },
  { name: 'Kebersihan', type: 'EXPENSE', description: 'Biaya kebersihan dan sanitasi' },
  { name: 'ATK & Perlengkapan', type: 'EXPENSE', description: 'Alat tulis dan perlengkapan kantor' },
  { name: 'Renovasi & Pemeliharaan', type: 'EXPENSE', description: 'Biaya renovasi dan pemeliharaan gedung' },
  { name: 'Transportasi', type: 'EXPENSE', description: 'Biaya transportasi' },
  { name: 'Kesehatan', type: 'EXPENSE', description: 'Biaya kesehatan santri' },
  { name: 'Internet & Telekomunikasi', type: 'EXPENSE', description: 'Biaya internet dan telekomunikasi' },
  { name: 'Buku & Kitab', type: 'EXPENSE', description: 'Pembelian buku dan kitab' },
  { name: 'Kegiatan Santri', type: 'EXPENSE', description: 'Biaya kegiatan ekstrakurikuler' },
  { name: 'Operasional Kantor', type: 'EXPENSE', description: 'Biaya operasional kantor' },
  { name: 'Pajak & Retribusi', type: 'EXPENSE', description: 'Pembayaran pajak dan retribusi' },
  { name: 'Amal & Sosial', type: 'EXPENSE', description: 'Pengeluaran untuk amal dan sosial' },
  { name: 'Lain-lain', type: 'EXPENSE', description: 'Pengeluaran lainnya' },
]

async function main() {
  console.log('🌱 Seeding transaction categories...')

  for (const category of categories) {
    const existing = await prisma.transactionCategory.findFirst({
      where: {
        name: category.name,
        type: category.type
      }
    })

    if (!existing) {
      await prisma.transactionCategory.create({
        data: category
      })
      console.log(`✅ Created ${category.type}: ${category.name}`)
    } else {
      console.log(`⏭️  Skipped ${category.type}: ${category.name} (already exists)`)
    }
  }

  console.log('\n✨ Transaction categories seeded successfully!')
  
  // Show summary
  const incomeCount = await prisma.transactionCategory.count({ where: { type: 'INCOME' } })
  const expenseCount = await prisma.transactionCategory.count({ where: { type: 'EXPENSE' } })
  
  console.log(`\n📊 Summary:`)
  console.log(`   Income categories: ${incomeCount}`)
  console.log(`   Expense categories: ${expenseCount}`)
  console.log(`   Total: ${incomeCount + expenseCount}`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding categories:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


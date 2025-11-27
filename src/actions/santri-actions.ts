'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { encrypt, decrypt } from "@/lib/encryption"

// Helper to convert empty string or undefined to null
const emptyToNull = z.preprocess((val) => {
  if (val === '' || val === undefined) return null
  return val
}, z.string().nullable())

const SantriSchema = z.object({
  nis: z.string().min(1),
  nisn: emptyToNull,
  nama: z.string().min(1),
  gender: z.enum(['L', 'P']),
  birthPlace: emptyToNull,
  birthDate: emptyToNull,
  address: emptyToNull,
  phone: emptyToNull,
  email: z.preprocess((val) => {
    if (val === '' || val === undefined) return null
    return val
  }, z.string().email().nullable()),
  
  // Administrative
  bpjsNumber: emptyToNull,
  kkNumber: emptyToNull,
  nikNumber: emptyToNull,
  previousSchool: emptyToNull,
  status: z.string().default('ACTIVE'),
  
  // Guardian - Father
  fatherName: emptyToNull,
  fatherNik: emptyToNull,
  fatherPhone: emptyToNull,
  fatherJob: emptyToNull,
  fatherIncome: emptyToNull,
  
  // Guardian - Mother
  motherName: emptyToNull,
  motherNik: emptyToNull,
  motherPhone: emptyToNull,
  motherJob: emptyToNull,
  motherIncome: emptyToNull,
  
  // Guardian - Wali
  waliName: emptyToNull,
  waliNik: emptyToNull,
  waliPhone: emptyToNull,
  waliJob: emptyToNull,
  waliRelation: emptyToNull,
  
  // Relations
  lembagaId: z.string().min(1),
  kelasId: emptyToNull,
  asramaId: emptyToNull,
  halqohId: emptyToNull,
})

export async function getSantriList() {
  const santriList = await prisma.santri.findMany({
    include: {
      lembaga: true,
      kelas: true,
      asrama: true,
      halqoh: true,
      _count: {
        select: {
          nilais: true,
          tahfidzRecords: true,
          violations: true,
        }
      }
    },
    orderBy: { nama: 'asc' }
  })

  // Decrypt sensitive fields before sending to client
  return santriList.map(santri => ({
    ...santri,
    nikNumber: santri.nikNumber ? decrypt(santri.nikNumber) : null,
    phone: santri.phone ? decrypt(santri.phone) : null,
    address: santri.address ? decrypt(santri.address) : null,
    fatherNik: santri.fatherNik ? decrypt(santri.fatherNik) : null,
    fatherPhone: santri.fatherPhone ? decrypt(santri.fatherPhone) : null,
    motherNik: santri.motherNik ? decrypt(santri.motherNik) : null,
    motherPhone: santri.motherPhone ? decrypt(santri.motherPhone) : null,
    waliNik: santri.waliNik ? decrypt(santri.waliNik) : null,
    waliPhone: santri.waliPhone ? decrypt(santri.waliPhone) : null,
  }))
}

export async function getSantriById(id: string) {
  const santri = await prisma.santri.findUnique({
    where: { id },
    include: {
      lembaga: true,
      kelas: true,
      asrama: true,
      halqoh: true,
      nilais: {
        include: {
          ujian: {
            include: {
              mapel: true
            }
          }
        },
        orderBy: { ujian: { date: 'desc' } }
      },
      tahfidzRecords: {
        orderBy: { date: 'desc' }
      },
      kelasHistory: {
        include: {
          kelas: true
        },
        orderBy: { startDate: 'desc' }
      },
      violations: {
        orderBy: { date: 'desc' }
      },
      tagihans: {
        orderBy: { dueDate: 'desc' }
      }
    }
  })

  if (!santri) return null

  // Decrypt sensitive fields
  return {
    ...santri,
    nikNumber: santri.nikNumber ? decrypt(santri.nikNumber) : null,
    phone: santri.phone ? decrypt(santri.phone) : null,
    address: santri.address ? decrypt(santri.address) : null,
    fatherNik: santri.fatherNik ? decrypt(santri.fatherNik) : null,
    fatherPhone: santri.fatherPhone ? decrypt(santri.fatherPhone) : null,
    motherNik: santri.motherNik ? decrypt(santri.motherNik) : null,
    motherPhone: santri.motherPhone ? decrypt(santri.motherPhone) : null,
    waliNik: santri.waliNik ? decrypt(santri.waliNik) : null,
    waliPhone: santri.waliPhone ? decrypt(santri.waliPhone) : null,
  }
}

export async function createSantri(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries())
  console.log('Raw form data:', rawData)
  
  const validatedData = SantriSchema.safeParse(rawData)

  if (!validatedData.success) {
    console.error('Validation error:', validatedData.error)
    console.error('Field errors:', validatedData.error.flatten().fieldErrors)
    const fieldErrors = validatedData.error.flatten().fieldErrors
    const firstError = Object.values(fieldErrors)[0]?.[0]
    return { 
      success: false, 
      error: firstError || 'Validation failed',
      details: validatedData.error.flatten() 
    }
  }

  try {
    const data = validatedData.data
    
    // Encrypt sensitive fields before saving
    const encryptedData = {
      nis: data.nis,
      nisn: data.nisn || null,
      nama: data.nama,
      gender: data.gender,
      birthPlace: data.birthPlace || null,
      birthDate: data.birthDate ? new Date(data.birthDate) : null,
      
      // Encrypt address and phone
      address: data.address ? encrypt(data.address) : null,
      phone: data.phone ? encrypt(data.phone) : null,
      email: data.email || null,
      
      // Encrypt NIK numbers
      bpjsNumber: data.bpjsNumber || null,
      kkNumber: data.kkNumber || null,
      nikNumber: data.nikNumber ? encrypt(data.nikNumber) : null,
      previousSchool: data.previousSchool || null,
      status: data.status,
      
      fatherName: data.fatherName || null,
      fatherNik: data.fatherNik ? encrypt(data.fatherNik) : null,
      fatherPhone: data.fatherPhone ? encrypt(data.fatherPhone) : null,
      fatherJob: data.fatherJob || null,
      fatherIncome: data.fatherIncome || null,
      
      motherName: data.motherName || null,
      motherNik: data.motherNik ? encrypt(data.motherNik) : null,
      motherPhone: data.motherPhone ? encrypt(data.motherPhone) : null,
      motherJob: data.motherJob || null,
      motherIncome: data.motherIncome || null,
      
      waliName: data.waliName || null,
      waliNik: data.waliNik ? encrypt(data.waliNik) : null,
      waliPhone: data.waliPhone ? encrypt(data.waliPhone) : null,
      waliJob: data.waliJob || null,
      waliRelation: data.waliRelation || null,
      
      lembagaId: data.lembagaId,
      kelasId: data.kelasId || null,
      asramaId: data.asramaId || null,
      halqohId: data.halqohId || null,
    }
    
    const santri = await prisma.santri.create({
      data: encryptedData
    })

    // Create initial class history if kelas is assigned
    if (data.kelasId) {
      await prisma.kelasHistory.create({
        data: {
          santriId: santri.id,
          kelasId: data.kelasId,
          academicYear: new Date().getFullYear() + "/" + (new Date().getFullYear() + 1),
          status: 'CURRENT'
        }
      })
    }

    revalidatePath('/dashboard/santri')
    return { success: true, id: santri.id }
  } catch (error) {
    console.error('Database error:', error)
    return { success: false, error: 'Failed to create santri' }
  }
}

export async function updateSantri(id: string, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries())
  const validatedData = SantriSchema.safeParse(rawData)

  if (!validatedData.success) {
    return { success: false, error: validatedData.error.flatten() }
  }

  try {
    const data = validatedData.data
    
    // Encrypt sensitive fields before updating
    const encryptedData = {
      nis: data.nis,
      nisn: data.nisn || null,
      nama: data.nama,
      gender: data.gender,
      birthPlace: data.birthPlace || null,
      birthDate: data.birthDate ? new Date(data.birthDate) : null,
      
      // Encrypt address and phone
      address: data.address ? encrypt(data.address) : null,
      phone: data.phone ? encrypt(data.phone) : null,
      email: data.email || null,
      
      // Encrypt NIK numbers
      bpjsNumber: data.bpjsNumber || null,
      kkNumber: data.kkNumber || null,
      nikNumber: data.nikNumber ? encrypt(data.nikNumber) : null,
      previousSchool: data.previousSchool || null,
      status: data.status,
      
      fatherName: data.fatherName || null,
      fatherNik: data.fatherNik ? encrypt(data.fatherNik) : null,
      fatherPhone: data.fatherPhone ? encrypt(data.fatherPhone) : null,
      fatherJob: data.fatherJob || null,
      fatherIncome: data.fatherIncome || null,
      
      motherName: data.motherName || null,
      motherNik: data.motherNik ? encrypt(data.motherNik) : null,
      motherPhone: data.motherPhone ? encrypt(data.motherPhone) : null,
      motherJob: data.motherJob || null,
      motherIncome: data.motherIncome || null,
      
      waliName: data.waliName || null,
      waliNik: data.waliNik ? encrypt(data.waliNik) : null,
      waliPhone: data.waliPhone ? encrypt(data.waliPhone) : null,
      waliJob: data.waliJob || null,
      waliRelation: data.waliRelation || null,
      
      lembagaId: data.lembagaId,
      kelasId: data.kelasId || null,
      asramaId: data.asramaId || null,
      halqohId: data.halqohId || null,
    }
    
    await prisma.santri.update({
      where: { id },
      data: encryptedData
    })

    revalidatePath('/dashboard/santri')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to update santri' }
  }
}

export async function deleteSantri(id: string) {
  try {
    // Delete all related records first to avoid foreign key constraint errors
    await prisma.$transaction([
      // Delete class history
      prisma.kelasHistory.deleteMany({
        where: { santriId: id }
      }),
      // Delete tahfidz records
      prisma.tahfidz.deleteMany({
        where: { santriId: id }
      }),
      // Delete violations
      prisma.violation.deleteMany({
        where: { santriId: id }
      }),
      // Delete billings (this will cascade to payments)
      prisma.billing.deleteMany({
        where: { santriId: id }
      }),
      // Delete tagihans
      prisma.tagihan.deleteMany({
        where: { santriId: id }
      }),
      // Delete nilai
      prisma.nilai.deleteMany({
        where: { santriId: id }
      }),
      // Finally delete the santri
      prisma.santri.delete({
        where: { id }
      })
    ])
    
    revalidatePath('/dashboard/santri')
    return { success: true }
  } catch (error) {
    console.error('Delete santri error:', error)
    return { success: false, error: 'Failed to delete santri: ' + (error instanceof Error ? error.message : 'Unknown error') }
  }
}

export async function bulkImportSantri(santriData: any[]) {
  try {
    let successCount = 0
    const errors: string[] = []

    for (const data of santriData) {
      try {
        // Skip if NIS or nama is empty
        if (!data.nis || !data.nama) {
          errors.push(`Baris dilewati: NIS atau Nama kosong`)
          continue
        }

        // Check if NIS already exists
        const existing = await prisma.santri.findUnique({
          where: { nis: data.nis }
        })

        if (existing) {
          errors.push(`NIS ${data.nis} sudah ada`)
          continue
        }

        // Create santri
        const santri = await prisma.santri.create({
          data: {
            nis: data.nis,
            nisn: data.nisn || null,
            nama: data.nama,
            gender: data.gender,
            birthPlace: data.birthPlace || null,
            birthDate: data.birthDate ? new Date(data.birthDate) : null,
            address: data.address || null,
            phone: data.phone || null,
            email: data.email || null,
            
            fatherName: data.fatherName || null,
            fatherPhone: data.fatherPhone || null,
            fatherJob: data.fatherJob || null,
            
            motherName: data.motherName || null,
            motherPhone: data.motherPhone || null,
            motherJob: data.motherJob || null,
            
            waliName: data.waliName || null,
            waliPhone: data.waliPhone || null,
            waliRelation: data.waliRelation || null,
            
            lembagaId: data.lembagaId,
            kelasId: data.kelasId || null,
            entryDate: data.entryDate ? new Date(data.entryDate) : new Date(),
            status: data.status || 'ACTIVE',
          }
        })

        // Create class history if kelas is assigned
        if (data.kelasId) {
          await prisma.kelasHistory.create({
            data: {
              santriId: santri.id,
              kelasId: data.kelasId,
              academicYear: new Date().getFullYear() + "/" + (new Date().getFullYear() + 1),
              status: 'CURRENT'
            }
          })
        }

        successCount++
      } catch (error) {
        console.error('Error importing santri:', error)
        errors.push(`Gagal import ${data.nama}: ${error}`)
      }
    }

    revalidatePath('/dashboard/santri')
    
    if (errors.length > 0) {
      console.log('Import errors:', errors)
    }

    return { 
      success: true, 
      count: successCount,
      errors: errors.length > 0 ? errors : undefined
    }
  } catch (error) {
    console.error('Bulk import error:', error)
    return { success: false, error: 'Failed to import santri data' }
  }
}

// Get santri by kelas ID
export async function getSantriByKelas(kelasId: string) {
  try {
    return await prisma.santri.findMany({
      where: {
        kelasId,
        status: "ACTIVE"
      },
      select: {
        id: true,
        nis: true,
        nama: true,
      },
      orderBy: { nama: 'asc' }
    })
  } catch (error) {
    console.error("Error fetching santri by kelas:", error)
    return []
  }
}


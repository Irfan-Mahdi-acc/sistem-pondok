'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getDocumentTypeInfo } from "@/lib/document-types"

export async function getDocuments(lembagaId?: string) {
  return await prisma.documentArchive.findMany({
    where: lembagaId ? { lembagaId } : {},
    include: {
      lembaga: true
    },
    orderBy: { date: 'desc' }
  })
}

export async function getDocumentById(id: string) {
  return await prisma.documentArchive.findUnique({
    where: { id },
    include: {
      lembaga: true
    }
  })
}

/**
 * Generate nomor surat otomatis berdasarkan tipe, tanggal, dan lembaga
 * Format Pondok: XXX/TYPE/MONTH/YEAR
 * Format Lembaga: XXX/TYPE/LEMBAGA/MONTH/YEAR
 * 
 * Contoh:
 * - Pondok: 001/SK-P/XI/2024
 * - Lembaga: 001/SKet-S/MTs/XI/2024
 */
async function generateDocumentNumber(
  type: string, 
  date: Date, 
  lembagaId?: string | null
): Promise<string> {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const monthRoman = [
    'I', 'II', 'III', 'IV', 'V', 'VI',
    'VII', 'VIII', 'IX', 'X', 'XI', 'XII'
  ][month - 1]

  // Get type code from comprehensive list
  const typeInfo = getDocumentTypeInfo(type)
  const code = typeInfo.code

  // Get lembaga code if specified
  let lembagaCode = ''
  if (lembagaId) {
    const lembaga = await prisma.lembaga.findUnique({
      where: { id: lembagaId },
      select: { jenjang: true, name: true }
    })
    
    if (lembaga) {
      // Use jenjang if available, otherwise create short code from name
      lembagaCode = lembaga.jenjang || 
        lembaga.name
          .split(' ')
          .map(word => word[0])
          .join('')
          .toUpperCase()
          .slice(0, 4)
    }
  }

  // Cari dokumen terakhir dengan kriteria yang sama
  const whereClause: any = {
    type,
    lembagaId: lembagaId || null,
    date: {
      gte: new Date(year, month - 1, 1),
      lt: new Date(year, month, 1)
    }
  }

  const lastDocument = await prisma.documentArchive.findFirst({
    where: whereClause,
    orderBy: { createdAt: 'desc' }
  })

  // Extract nomor urut dari nomor terakhir
  let sequence = 1
  if (lastDocument && lastDocument.number) {
    const match = lastDocument.number.match(/^(\d+)\//)
    if (match) {
      sequence = parseInt(match[1]) + 1
    }
  }

  // Format nomor dengan padding 3 digit
  const sequenceStr = sequence.toString().padStart(3, '0')
  
  // Build nomor surat
  if (lembagaCode) {
    return `${sequenceStr}/${code}/${lembagaCode}/${monthRoman}/${year}`
  } else {
    return `${sequenceStr}/${code}/${monthRoman}/${year}`
  }
}

export async function createDocument(formData: FormData) {
  try {
    const type = formData.get('type') as string
    const date = new Date(formData.get('date') as string)
    const lembagaId = formData.get('lembagaId') as string || null
    const fileUrl = formData.get('fileUrl') as string || ''
    
    // Generate nomor surat otomatis
    const generatedNumber = await generateDocumentNumber(type, date, lembagaId)
    
    const data = {
      title: formData.get('title') as string,
      type,
      number: generatedNumber,
      date,
      sender: null, // Removed - not needed
      recipient: null, // Removed - not needed
      fileUrl: fileUrl || '-', // Default to '-' if empty
      description: formData.get('description') as string || null,
      lembagaId: lembagaId || null,
    }

    await prisma.documentArchive.create({ data })
    revalidatePath('/dashboard/kantor/surat')
    return { success: true, number: generatedNumber }
  } catch (error) {
    console.error('Create document error:', error)
    return { success: false, error: 'Gagal menambah dokumen' }
  }
}

export async function updateDocument(id: string, formData: FormData) {
  try {
    const data = {
      title: formData.get('title') as string,
      type: formData.get('type') as string,
      number: formData.get('number') as string || null,
      date: new Date(formData.get('date') as string),
      sender: formData.get('sender') as string || null,
      recipient: formData.get('recipient') as string || null,
      fileUrl: formData.get('fileUrl') as string,
      description: formData.get('description') as string || null,
    }

    await prisma.documentArchive.update({
      where: { id },
      data
    })
    
    revalidatePath('/dashboard/kantor/surat')
    return { success: true }
  } catch (error) {
    console.error('Update document error:', error)
    return { success: false, error: 'Gagal mengupdate dokumen' }
  }
}

export async function deleteDocument(id: string) {
  try {
    await prisma.documentArchive.delete({
      where: { id }
    })
    revalidatePath('/dashboard/kantor/surat')
    return { success: true }
  } catch (error) {
    console.error('Delete document error:', error)
    return { success: false, error: 'Gagal menghapus dokumen' }
  }
}

export async function getDocumentStats() {
  const documents = await prisma.documentArchive.findMany()
  
  return {
    total: documents.length,
    suratMasuk: documents.filter(d => d.type === 'SURAT_MASUK').length,
    suratKeluar: documents.filter(d => d.type === 'SURAT_KELUAR').length,
    sk: documents.filter(d => d.type === 'SK').length,
  }
}


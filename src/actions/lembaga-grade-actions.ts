"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Validation Schema for Lembaga Grades
const LembagaGradeSchema = z.object({
  santriId: z.string().min(1, "Santri harus dipilih"),
  lembagaId: z.string().min(1, "Lembaga harus dipilih"),
  category: z.string().min(1, "Kategori harus dipilih"),
  gradeType: z.enum(["NUMERIC", "LETTER"]),
  score: z.number().min(0).max(100).nullable().optional(),
  letterGrade: z.enum(["A", "B", "C", "D", "E"]).nullable().optional(),
})

const BulkLembagaGradeSchema = z.object({
  lembagaId: z.string().min(1, "Lembaga harus dipilih"),
  category: z.string().min(1, "Kategori harus dipilih"),
  gradeType: z.enum(["NUMERIC", "LETTER"]),
  nilaiData: z.array(z.object({
    santriId: z.string(),
    score: z.number().min(0).max(100).nullable().optional(),
    letterGrade: z.enum(["A", "B", "C", "D", "E"]).nullable().optional(),
    nilaiId: z.string().nullable().optional(),
  }))
})

// Get lembaga grade input data (santri list with their grades)
export async function getLembagaGradeInputData(lembagaId: string, category: string) {
  try {
    const lembaga = await prisma.lembaga.findUnique({
      where: { id: lembagaId },
      include: {
        santris: {
          where: {
            status: "ACTIVE"
          },
          select: {
            id: true,
            nis: true,
            nama: true,
          },
          orderBy: {
            nama: 'asc'
          }
        },
        nilais: {
          where: {
            category,
            mapelId: null, // Only non-subject grades
          },
          select: {
            id: true,
            santriId: true,
            gradeType: true,
            score: true,
            letterGrade: true,
          }
        }
      }
    })

    if (!lembaga) {
      throw new Error("Lembaga not found")
    }

    // Map nilai to santri
    const santriList = lembaga.santris.map((santri: any) => {
      const nilai = lembaga.nilais.find((n: any) => n.santriId === santri.id)
      return {
        ...santri,
        nilaiId: nilai?.id || null,
        gradeType: nilai?.gradeType || "NUMERIC",
        score: nilai?.score || null,
        letterGrade: nilai?.letterGrade || null,
      }
    })

    return {
      lembaga: {
        id: lembaga.id,
        name: lembaga.name,
      },
      santriList,
    }
  } catch (error) {
    console.error("Error fetching lembaga grade input data:", error)
    throw new Error("Failed to fetch lembaga grade input data")
  }
}

// Create or update a single lembaga grade
export async function createOrUpdateLembagaGrade(data: {
  santriId: string
  lembagaId: string
  category: string
  gradeType: "NUMERIC" | "LETTER"
  score?: number | null
  letterGrade?: string | null
  nilaiId?: string | null
}) {
  const validatedData = LembagaGradeSchema.safeParse(data)

  if (!validatedData.success) {
    return { 
      success: false, 
      error: validatedData.error.flatten().fieldErrors 
    }
  }

  try {
    // Check if nilai already exists
    if (data.nilaiId) {
      // Update existing nilai
      await prisma.nilai.update({
        where: { id: data.nilaiId },
        data: {
          gradeType: validatedData.data.gradeType,
          score: validatedData.data.gradeType === "NUMERIC" ? validatedData.data.score : null,
          letterGrade: validatedData.data.gradeType === "LETTER" ? validatedData.data.letterGrade : null,
          category: validatedData.data.category,
        }
      })
    } else {
      // Check if nilai exists without nilaiId (edge case)
      const existingNilai = await prisma.nilai.findFirst({
        where: {
          santriId: validatedData.data.santriId,
          lembagaId: validatedData.data.lembagaId,
          category: validatedData.data.category,
          mapelId: null,
        }
      })

      if (existingNilai) {
        // Update existing
        await prisma.nilai.update({
          where: { id: existingNilai.id },
          data: {
            gradeType: validatedData.data.gradeType,
            score: validatedData.data.gradeType === "NUMERIC" ? validatedData.data.score : null,
            letterGrade: validatedData.data.gradeType === "LETTER" ? validatedData.data.letterGrade : null,
          }
        })
      } else {
        // Create new nilai
        await prisma.nilai.create({
          data: {
            santriId: validatedData.data.santriId,
            lembagaId: validatedData.data.lembagaId,
            category: validatedData.data.category,
            gradeType: validatedData.data.gradeType,
            score: validatedData.data.gradeType === "NUMERIC" ? validatedData.data.score : null,
            letterGrade: validatedData.data.gradeType === "LETTER" ? validatedData.data.letterGrade : null,
            mapelId: null, // No mapel for lembaga grades
            ujianId: null, // No ujian for lembaga grades
          }
        })
      }
    }

    revalidatePath('/dashboard/lembaga')
    return { success: true }
  } catch (error) {
    console.error("Error creating/updating lembaga grade:", error)
    return { 
      success: false, 
      error: "Gagal menyimpan nilai: " + (error instanceof Error ? error.message : String(error))
    }
  }
}

// Bulk create/update lembaga grades
export async function bulkCreateLembagaGrades(data: {
  lembagaId: string
  category: string
  gradeType: "NUMERIC" | "LETTER"
  nilaiData: { 
    santriId: string
    score?: number | null
    letterGrade?: string | null
    nilaiId?: string | null 
  }[]
}) {
  const validatedData = BulkLembagaGradeSchema.safeParse(data)

  if (!validatedData.success) {
    return { 
      success: false, 
      error: validatedData.error.flatten().fieldErrors 
    }
  }

  try {
    // Process each nilai
    for (const nilaiItem of data.nilaiData) {
      // Skip if both score and letterGrade are null
      if (data.gradeType === "NUMERIC" && (nilaiItem.score === null || nilaiItem.score === undefined)) {
        continue
      }
      if (data.gradeType === "LETTER" && !nilaiItem.letterGrade) {
        continue
      }

      await createOrUpdateLembagaGrade({
        santriId: nilaiItem.santriId,
        lembagaId: data.lembagaId,
        category: data.category,
        gradeType: data.gradeType,
        score: nilaiItem.score,
        letterGrade: nilaiItem.letterGrade,
        nilaiId: nilaiItem.nilaiId,
      })
    }

    revalidatePath('/dashboard/lembaga')
    return { success: true }
  } catch (error) {
    console.error("Error bulk creating lembaga grades:", error)
    return { 
      success: false, 
      error: "Gagal menyimpan nilai: " + (error instanceof Error ? error.message : String(error))
    }
  }
}

// Delete lembaga grade
export async function deleteLembagaGrade(nilaiId: string) {
  try {
    await prisma.nilai.delete({
      where: { id: nilaiId }
    })

    revalidatePath('/dashboard/lembaga')
    return { success: true }
  } catch (error) {
    console.error("Error deleting lembaga grade:", error)
    return { 
      success: false, 
      error: "Gagal menghapus nilai" 
    }
  }
}

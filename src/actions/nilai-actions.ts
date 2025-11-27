"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Validation Schema - Updated to 1-10 scale
const NilaiSchema = z.object({
  score: z.coerce.number().min(1, "Nilai minimal 1").max(10, "Nilai maksimal 10"),
  santriId: z.string().min(1, "Santri harus dipilih"),
  mapelId: z.string().min(1, "Mapel harus dipilih"),
  ujianId: z.string().min(1, "Ujian harus dipilih"),
})

const BulkNilaiSchema = z.object({
  ujianId: z.string().min(1, "Ujian harus dipilih"),
  mapelId: z.string().min(1, "Mapel harus dipilih"),
  nilaiData: z.array(z.object({
    santriId: z.string(),
    score: z.coerce.number().min(1).max(10),
  }))
})

// Get all nilai for a specific ujian
export async function getNilaiByUjian(ujianId: string) {
  try {
    const nilaiList = await prisma.nilai.findMany({
      where: { ujianId },
      include: {
        santri: {
          select: {
            id: true,
            nis: true,
            nama: true,
          }
        }
      },
      orderBy: {
        santri: {
          nama: 'asc'
        }
      }
    })
    return nilaiList
  } catch (error) {
    console.error("Error fetching nilai:", error)
    throw new Error("Failed to fetch nilai")
  }
}

// Get all santri in a mapel (through kelas)
export async function getSantriByMapel(mapelId: string) {
  try {
    const mapel = await prisma.mapel.findUnique({
      where: { id: mapelId },
      include: {
        kelas: {
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
            }
          }
        }
      }
    })

    if (!mapel) {
      throw new Error("Mapel not found")
    }

    return mapel.kelas.santris
  } catch (error) {
    console.error("Error fetching santri:", error)
    throw new Error("Failed to fetch santri")
  }
}

// Get nilai with santri list for input page
export async function getNilaiInputData(ujianId: string) {
  try {
    const ujian = await prisma.ujian.findUnique({
      where: { id: ujianId },
      include: {
        mapel: {
          include: {
            kelas: {
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
                }
              }
            }
          }
        },
        nilais: {
          select: {
            id: true,
            santriId: true,
            score: true,
          }
        }
      }
    })

    if (!ujian) {
      throw new Error("Ujian not found")
    }

    // Map nilai to santri
    const santriList = ujian.mapel.kelas.santris.map((santri: any) => {
      const nilai = ujian.nilais.find((n: any) => n.santriId === santri.id)
      return {
        ...santri,
        nilaiId: nilai?.id || null,
        score: nilai?.score || null,
      }
    })

    return {
      ujian: {
        id: ujian.id,
        name: ujian.name,
        type: ujian.type,
        date: ujian.date,
        mapelId: ujian.mapelId,
      },
      santriList,
    }
  } catch (error) {
    console.error("Error fetching nilai input data:", error)
    throw new Error("Failed to fetch nilai input data")
  }
}

// Create or update a single nilai
export async function createOrUpdateNilai(data: {
  santriId: string
  mapelId: string
  ujianId: string
  score: number
  nilaiId?: string | null
}) {
  const validatedData = NilaiSchema.safeParse(data)

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
          score: validatedData.data.score,
        }
      })
    } else {
      // Check if nilai exists without nilaiId (edge case)
      const existingNilai = await prisma.nilai.findFirst({
        where: {
          santriId: validatedData.data.santriId,
          ujianId: validatedData.data.ujianId,
        }
      })

      if (existingNilai) {
        // Update existing
        await prisma.nilai.update({
          where: { id: existingNilai.id },
          data: {
            score: validatedData.data.score,
          }
        })
      } else {
        // Create new nilai
        await prisma.nilai.create({
          data: validatedData.data
        })
      }
    }

    revalidatePath('/dashboard/academic/exams')
    revalidatePath('/dashboard/academic/rapor')
    return { success: true }
  } catch (error) {
    console.error("Error creating/updating nilai:", error)
    return { 
      success: false, 
      error: "Gagal menyimpan nilai: " + (error instanceof Error ? error.message : String(error))
    }
  }
}

// Bulk create/update nilai
export async function bulkCreateNilai(data: {
  ujianId: string
  mapelId: string
  nilaiData: { santriId: string; score: number; nilaiId?: string | null }[]
}) {
  const validatedData = BulkNilaiSchema.safeParse(data)

  if (!validatedData.success) {
    return { 
      success: false, 
      error: validatedData.error.flatten().fieldErrors 
    }
  }

  try {
    // Process each nilai
    for (const nilaiItem of data.nilaiData) {
      // Skip if score is null or empty
      if (nilaiItem.score === null || nilaiItem.score === undefined) {
        continue
      }

      await createOrUpdateNilai({
        santriId: nilaiItem.santriId,
        mapelId: data.mapelId,
        ujianId: data.ujianId,
        score: nilaiItem.score,
        nilaiId: nilaiItem.nilaiId,
      })
    }

    revalidatePath('/dashboard/academic/exams')
    revalidatePath('/dashboard/academic/rapor')
    return { success: true }
  } catch (error) {
    console.error("Error bulk creating nilai:", error)
    return { 
      success: false, 
      error: "Gagal menyimpan nilai: " + (error instanceof Error ? error.message : String(error))
    }
  }
}

// Delete nilai
export async function deleteNilai(nilaiId: string) {
  try {
    await prisma.nilai.delete({
      where: { id: nilaiId }
    })

    revalidatePath('/dashboard/academic/exams')
    revalidatePath('/dashboard/academic/rapor')
    return { success: true }
  } catch (error) {
    console.error("Error deleting nilai:", error)
    return { 
      success: false, 
      error: "Gagal menghapus nilai" 
    }
  }
}

// Delete all nilai for an ujian
export async function deleteAllNilaiByUjian(ujianId: string) {
  try {
    await prisma.nilai.deleteMany({
      where: { ujianId }
    })

    revalidatePath('/dashboard/academic/exams')
    revalidatePath('/dashboard/academic/rapor')
    return { success: true }
  } catch (error) {
    console.error("Error deleting nilai:", error)
    return { 
      success: false, 
      error: "Gagal menghapus semua nilai" 
    }
  }
}

// Get nilai by exam ID
export async function getNilaiByExam(examId: string) {
  try {
    return await prisma.nilai.findMany({
      where: { ujianId: examId },
      include: {
        santri: {
          select: {
            id: true,
            nis: true,
            nama: true,
          }
        }
      }
    })
  } catch (error) {
    console.error("Error fetching nilai by exam:", error)
    return []
  }
}

// Save nilai (bulk upsert)
export async function saveNilai(nilaiData: Array<{
  santriId: string
  examId: string
  score: number
  academicYearId: string
  semester: string
}>) {
  try {
    // Get exam details to get mapelId
    const exam = await prisma.ujian.findUnique({
      where: { id: nilaiData[0]?.examId },
      select: { mapelId: true }
    })

    if (!exam) {
      return { success: false, error: "Ujian tidak ditemukan" }
    }

    // Process each nilai
    for (const item of nilaiData) {
      if (!item.score || item.score === 0) continue

      // Check if nilai exists
      const existing = await prisma.nilai.findFirst({
        where: {
          santriId: item.santriId,
          ujianId: item.examId
        }
      })

      if (existing) {
        // Update
        await prisma.nilai.update({
          where: { id: existing.id },
          data: {
            score: item.score,
            academicYearId: item.academicYearId,
            semester: item.semester
          }
        })
      } else {
        // Create
        await prisma.nilai.create({
          data: {
            santriId: item.santriId,
            ujianId: item.examId,
            mapelId: exam.mapelId,
            score: item.score,
            gradeType: "NUMERIC",
            category: "UJIAN",
            academicYearId: item.academicYearId,
            semester: item.semester
          }
        })
      }
    }

    revalidatePath('/dashboard/academic/nilai-raport')
    return { success: true }
  } catch (error: any) {
    console.error("Error saving nilai:", error)
    return { success: false, error: error.message || "Gagal menyimpan nilai" }
  }
}

// Get nilai by category ID
export async function getNilaiByCategory(categoryId: string, academicYearId: string, semester: string) {
  try {
    return await prisma.nilai.findMany({
      where: {
        categoryId,
        academicYearId,
        semester
      },
      include: {
        santri: {
          select: {
            id: true,
            nis: true,
            nama: true,
          }
        }
      }
    })
  } catch (error) {
    console.error("Error fetching nilai by category:", error)
    return []
  }
}

// Save non-mapel nilai (bulk upsert)
export async function saveNonMapelNilai(nilaiData: Array<{
  santriId: string
  categoryId: string
  gradeType: string
  score?: number
  letterGrade?: string
  academicYearId: string
  semester: string
}>) {
  try {
    // Process each nilai
    for (const item of nilaiData) {
      // Check if nilai exists
      const existing = await prisma.nilai.findFirst({
        where: {
          santriId: item.santriId,
          categoryId: item.categoryId,
          academicYearId: item.academicYearId,
          semester: item.semester
        }
      })

      if (existing) {
        // Update
        await prisma.nilai.update({
          where: { id: existing.id },
          data: {
            score: item.score,
            letterGrade: item.letterGrade,
            gradeType: item.gradeType
          }
        })
      } else {
        // Create
        await prisma.nilai.create({
          data: {
            santriId: item.santriId,
            categoryId: item.categoryId,
            score: item.score,
            letterGrade: item.letterGrade,
            gradeType: item.gradeType,
            category: "NON_MAPEL",
            academicYearId: item.academicYearId,
            semester: item.semester
          }
        })
      }
    }

    revalidatePath('/dashboard/academic/nilai-raport')
    return { success: true }
  } catch (error: any) {
    console.error("Error saving non-mapel nilai:", error)
    return { success: false, error: error.message || "Gagal menyimpan nilai" }
  }
}

// Get all nilai for a class (for raport) - UPDATED to include ujian relation
export async function getAllNilaiForClass(kelasId: string, academicYearId: string, semester: string) {
  try {
    // Get all santri in the class
    const santriInClass = await prisma.santri.findMany({
      where: { kelasId, status: 'ACTIVE' },
      select: { id: true }
    })

    const santriIds = santriInClass.map(s => s.id)

    // Get all nilai for these santri (all categories) with ujian relation
    return await prisma.nilai.findMany({
      where: {
        santriId: { in: santriIds },
        academicYearId,
        semester
      },
      include: {
        mapel: {
          select: {
            id: true,
            name: true
          }
        },
        ujian: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      }
    })
  } catch (error) {
    console.error("Error fetching nilai for class:", error)
    return []
  }
}

// Get Ujian Hifdz data for class raport
export async function getUjianHifdzForClass(kelasId: string, academicYearId: string, semester: string) {
  try {
    // Get all santri in the class
    const santriInClass = await prisma.santri.findMany({
      where: { kelasId, status: 'ACTIVE' },
      select: { id: true }
    })

    const santriIds = santriInClass.map(s => s.id)

    // Get academic year dates to filter tahfidz records
    const academicYear = await prisma.academicYear.findUnique({
      where: { id: academicYearId },
      select: { startDate: true, endDate: true }
    })

    if (!academicYear) return []

    // Calculate semester date range
    const semesterNum = parseInt(semester)
    const startDate = academicYear.startDate
    const endDate = academicYear.endDate
    const midDate = new Date((startDate.getTime() + endDate.getTime()) / 2)

    const semesterStartDate = semesterNum === 1 ? startDate : midDate
    const semesterEndDate = semesterNum === 1 ? midDate : endDate

    // Get Ujian Hifdz records
    return await prisma.tahfidz.findMany({
      where: {
        santriId: { in: santriIds },
        type: 'UJIAN',
        date: {
          gte: semesterStartDate,
          lte: semesterEndDate
        }
      },
      select: {
        id: true,
        santriId: true,
        surah: true,
        ayatStart: true,
        ayatEnd: true,
        grade: true,
        note: true,
        date: true
      }
    })
  } catch (error) {
    console.error("Error fetching ujian hifdz for class:", error)
    return []
  }
}

// Save all categories for one student
export async function saveStudentNonMapelNilai(data: {
  santriId: string
  lembagaId: string
  academicYearId: string
  semester: string
  grades: Array<{
    categoryId: string
    gradeType: string
    score?: number
    letterGrade?: string
  }>
}) {
  try {
    // Process each grade
    for (const grade of data.grades) {
      // Check if nilai exists
      const existing = await prisma.nilai.findFirst({
        where: {
          santriId: data.santriId,
          categoryId: grade.categoryId,
          academicYearId: data.academicYearId,
          semester: data.semester
        }
      })

      if (existing) {
        // Update
        await prisma.nilai.update({
          where: { id: existing.id },
          data: {
            score: grade.score,
            letterGrade: grade.letterGrade,
            gradeType: grade.gradeType
          }
        })
      } else {
        // Create
        await prisma.nilai.create({
          data: {
            santriId: data.santriId,
            categoryId: grade.categoryId,
            score: grade.score,
            letterGrade: grade.letterGrade,
            gradeType: grade.gradeType,
            category: "NON_MAPEL",
            academicYearId: data.academicYearId,
            semester: data.semester
          }
        })
      }
    }

    revalidatePath('/dashboard/academic/nilai-raport')
    return { success: true }
  } catch (error: any) {
    console.error("Error saving student nilai:", error)
    return { success: false, error: error.message || "Gagal menyimpan nilai" }
  }
}

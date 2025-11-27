"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// Activate a semester for grading
export async function activateSemester(data: {
  lembagaId: string
  academicYearId: string
  semester: "1" | "2"
}) {
  try {
    // Check if academic year exists
    const academicYear = await prisma.academicYear.findUnique({
      where: { id: data.academicYearId }
    })

    if (!academicYear) {
      return { success: false, error: "Tahun akademik tidak ditemukan" }
    }

    // For now, just return success - semester is activated by user selection
    // In the future, this could create semester records, set flags, etc.
    
    revalidatePath(`/dashboard/academic/nilai-raport/${data.lembagaId}`)
    return { 
      success: true, 
      message: `Semester ${data.semester} tahun akademik ${academicYear.name} telah diaktifkan` 
    }
  } catch (error) {
    console.error("Error activating semester:", error)
    return { success: false, error: "Gagal mengaktifkan semester" }
  }
}

// Get semester status
export async function getSemesterStatus(
  lembagaId: string,
  academicYearId: string,
  semester: "1" | "2"
) {
  try {
    // Check if there are any grades for this semester
    const gradeCount = await prisma.nilai.count({
      where: {
        lembagaId,
        academicYearId,
        semester
      }
    })

    const hifdzCount = await prisma.tahfidz.count({
      where: {
        academicYearId,
        semester,
        santri: {
          lembagaId
        }
      }
    })

    const examCount = await prisma.ujian.count({
      where: {
        academicYearId,
        semester,
        mapel: {
          kelas: {
            lembagaId
          }
        }
      }
    })

    return {
      isActive: gradeCount > 0 || hifdzCount > 0 || examCount > 0,
      gradeCount,
      hifdzCount,
      examCount,
      totalRecords: gradeCount + hifdzCount + examCount
    }
  } catch (error) {
    console.error("Error getting semester status:", error)
    return {
      isActive: false,
      gradeCount: 0,
      hifdzCount: 0,
      examCount: 0,
      totalRecords: 0
    }
  }
}

// Migrate old data to semester system
export async function migrateDataToSemester(data: {
  lembagaId: string
  academicYearId: string
  semester: "1" | "2"
  dataType: "nilai" | "ujian" | "tahfidz" | "all"
}) {
  try {
    const academicYear = await prisma.academicYear.findUnique({
      where: { id: data.academicYearId }
    })

    if (!academicYear) {
      return { success: false, error: "Tahun akademik tidak ditemukan" }
    }

    let updatedCount = 0

    // Migrate Nilai (grades)
    if (data.dataType === "nilai" || data.dataType === "all") {
      const nilaiResult = await prisma.nilai.updateMany({
        where: {
          lembagaId: data.lembagaId,
          semester: null, // Only update records without semester
          academicYearId: null
        },
        data: {
          semester: data.semester,
          academicYearId: data.academicYearId
        }
      })
      updatedCount += nilaiResult.count
    }

    // Migrate Ujian (exams)
    if (data.dataType === "ujian" || data.dataType === "all") {
      const ujianResult = await prisma.ujian.updateMany({
        where: {
          mapel: {
            kelas: {
              lembagaId: data.lembagaId
            }
          },
          semester: null,
          academicYearId: null
        },
        data: {
          semester: data.semester,
          academicYearId: data.academicYearId
        }
      })
      updatedCount += ujianResult.count
    }

    // Migrate Tahfidz (hifdz records)
    if (data.dataType === "tahfidz" || data.dataType === "all") {
      const tahfidzResult = await prisma.tahfidz.updateMany({
        where: {
          santri: {
            lembagaId: data.lembagaId
          },
          semester: null,
          academicYearId: null
        },
        data: {
          semester: data.semester,
          academicYearId: data.academicYearId
        }
      })
      updatedCount += tahfidzResult.count
    }

    revalidatePath(`/dashboard/academic/nilai-raport/${data.lembagaId}`)
    return { 
      success: true, 
      updatedCount,
      message: `Berhasil memigrasikan ${updatedCount} data ke semester ${data.semester}` 
    }
  } catch (error) {
    console.error("Error migrating data:", error)
    return { success: false, error: "Gagal memigrasikan data" }
  }
}

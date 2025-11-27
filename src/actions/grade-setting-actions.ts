'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const GradeSettingSchema = z.object({
  lembagaId: z.string(),
  gradeValue: z.coerce.number().min(1).max(10),
  label: z.string().min(1, "Label tidak boleh kosong"),
  description: z.string().optional(),
})

export async function getGradeSettings(lembagaId: string) {
  try {
    const settings = await prisma.gradeSetting.findMany({
      where: { lembagaId },
      orderBy: { gradeValue: 'desc' },
    })
    
    return { success: true, data: settings }
  } catch (error) {
    console.error('Failed to fetch grade settings:', error)
    return { success: false, error: 'Gagal mengambil pengaturan nilai' }
  }
}

export async function createGradeSetting(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries())
  const validatedData = GradeSettingSchema.safeParse(rawData)

  if (!validatedData.success) {
    const errors = validatedData.error.flatten()
    const errorMessage = errors.fieldErrors.label?.[0] || 
                        errors.fieldErrors.gradeValue?.[0] || 
                        'Data tidak valid'
    return { success: false, error: errorMessage }
  }

  try {
    const data = validatedData.data
    await prisma.gradeSetting.create({
      data: {
        lembagaId: data.lembagaId,
        gradeValue: data.gradeValue,
        label: data.label,
        description: data.description,
      }
    })

    revalidatePath('/dashboard/settings/grades')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to create grade setting:', error)
    if (error.code === 'P2002') {
      return { success: false, error: 'Nilai ini sudah ada' }
    }
    return { success: false, error: 'Gagal menyimpan pengaturan nilai' }
  }
}

export async function updateGradeSetting(id: string, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries())
  
  const UpdateSchema = z.object({
    label: z.string().min(1, "Label tidak boleh kosong"),
    description: z.string().optional(),
  })

  const validatedData = UpdateSchema.safeParse(rawData)

  if (!validatedData.success) {
    const errors = validatedData.error.flatten()
    const errorMessage = errors.fieldErrors.label?.[0] || 'Data tidak valid'
    return { success: false, error: errorMessage }
  }

  try {
    const data = validatedData.data
    await prisma.gradeSetting.update({
      where: { id },
      data: {
        label: data.label,
        description: data.description,
      }
    })

    revalidatePath('/dashboard/settings/grades')
    return { success: true }
  } catch (error) {
    console.error('Failed to update grade setting:', error)
    return { success: false, error: 'Gagal mengupdate pengaturan nilai' }
  }
}

export async function deleteGradeSetting(id: string) {
  try {
    await prisma.gradeSetting.delete({
      where: { id }
    })

    revalidatePath('/dashboard/settings/grades')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete grade setting:', error)
    return { success: false, error: 'Gagal menghapus pengaturan nilai' }
  }
}

export async function initializeDefaultGrades(lembagaId: string) {
  try {
    // Check if already initialized
    const existing = await prisma.gradeSetting.findFirst({
      where: { lembagaId }
    })

    if (existing) {
      return { success: false, error: 'Pengaturan nilai sudah ada' }
    }

    // Default grade labels (Arabic style)
    const defaultGrades = [
      { gradeValue: 10, label: "تمام (Sempurna)", description: "Nilai sempurna" },
      { gradeValue: 9, label: "ممتاز (Mumtaz)", description: "Sangat baik sekali" },
      { gradeValue: 8, label: "جيد جدا (Jayyid Jiddan)", description: "Baik sekali" },
      { gradeValue: 7, label: "جيد (Jayyid)", description: "Baik" },
      { gradeValue: 6, label: "مقبول (Maqbul)", description: "Cukup" },
      { gradeValue: 5, label: "ضعيف (Dha'if)", description: "Lemah" },
      { gradeValue: 4, label: "ضعيف جدا (Dha'if Jiddan)", description: "Sangat lemah" },
      { gradeValue: 3, label: "راسب (Rasib)", description: "Gagal" },
      { gradeValue: 2, label: "راسب جدا (Rasib Jiddan)", description: "Sangat gagal" },
      { gradeValue: 1, label: "راسب تماما (Rasib Tamaman)", description: "Gagal total" },
    ]

    await prisma.gradeSetting.createMany({
      data: defaultGrades.map(grade => ({
        lembagaId,
        ...grade
      }))
    })

    revalidatePath('/dashboard/settings/grades')
    return { success: true, message: 'Pengaturan nilai default berhasil dibuat' }
  } catch (error) {
    console.error('Failed to initialize default grades:', error)
    return { success: false, error: 'Gagal membuat pengaturan nilai default' }
  }
}

'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getPDFLayoutByLembaga(lembagaId: string) {
  try {
    // Convert empty string to null for global settings
    const searchId = lembagaId === "" ? null : lembagaId

    const layout = await prisma.pDFLayoutSettings.findFirst({
      where: { lembagaId: searchId },
      include: { lembaga: true }
    })
    return layout
  } catch (error) {
    console.error("Error fetching PDF layout:", error)
    return null
  }
}

export async function getAllPDFLayouts() {
  try {
    const layouts = await prisma.pDFLayoutSettings.findMany({
      include: { lembaga: true },
      orderBy: { createdAt: 'desc' }
    })
    return layouts
  } catch (error) {
    console.error("Error fetching PDF layouts:", error)
    return []
  }
}

export async function upsertPDFLayout(data: {
  lembagaId: string
  showLogo?: boolean
  logoUrl?: string
  logoSize?: number
  content?: string
  headerText?: string
  schoolName?: string
  address?: string
  phone?: string
  email?: string
  website?: string
  showPondokName?: boolean
  pondokNameSize?: number
  footerText?: string
}) {
  try {
    // Convert empty string to null for global settings
    const lembagaId = data.lembagaId === "" ? null : data.lembagaId

    // Use findFirst instead of findUnique because lembagaId is nullable
    // and findUnique might have issues with null values in some Prisma versions/configurations
    const existing = await prisma.pDFLayoutSettings.findFirst({
      where: { lembagaId: lembagaId }
    })

    if (existing) {
      await prisma.pDFLayoutSettings.update({
        where: { id: existing.id },
        data: {
          showLogo: data.showLogo,
          logoUrl: data.logoUrl,
          logoSize: data.logoSize,
          content: data.content,
          headerText: data.headerText,
          schoolName: data.schoolName,
          address: data.address,
          phone: data.phone,
          email: data.email,
          website: data.website,
          showPondokName: data.showPondokName,
          pondokNameSize: data.pondokNameSize,
          footerText: data.footerText,
        }
      })
    } else {
      await prisma.pDFLayoutSettings.create({
        data: {
          lembagaId: lembagaId,
          showLogo: data.showLogo ?? true,
          logoUrl: data.logoUrl,
          logoSize: data.logoSize ?? 30,
          content: data.content,
          headerText: data.headerText,
          schoolName: data.schoolName,
          address: data.address,
          phone: data.phone,
          email: data.email,
          website: data.website,
          showPondokName: data.showPondokName ?? true,
          pondokNameSize: data.pondokNameSize ?? 14,
          footerText: data.footerText,
        }
      })
    }

    revalidatePath('/dashboard/settings')
    return { success: true }
  } catch (error) {
    console.error("Error upserting PDF layout:", error)
    return { success: false, error: "Gagal menyimpan pengaturan" }
  }
}

export async function deletePDFLayout(lembagaId: string) {
  try {
    await prisma.pDFLayoutSettings.delete({
      where: { lembagaId }
    })
    revalidatePath('/dashboard/settings')
    return { success: true }
  } catch (error) {
    console.error("Error deleting PDF layout:", error)
    return { success: false, error: "Gagal menghapus pengaturan" }
  }
}

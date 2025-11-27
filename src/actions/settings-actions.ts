'use server'

import { prisma } from "@/lib/prisma"

export async function getPDFSettings() {
  try {
    const settings = await prisma.pDFLayoutSettings.findFirst()
    const pondokProfile = await prisma.pondokProfile.findFirst()

    return {
      settings: settings || {
        showLogo: true,
        logoSize: 30,
        headerText: null,
        showPondokName: true,
        pondokNameSize: 14,
        footerText: null
      },
      pondokProfile: pondokProfile || {
        name: "PONDOK PESANTREN TADZIMUSSUNNAH",
        address: "Alamat Pondok",
        phone: "08123456789",
        email: "info@pondok.com",
        website: "www.pondok.com",
        logoUrl: null
      }
    }
  } catch (error) {
    console.error("Error fetching PDF settings:", error)
    return {
      settings: {
        showLogo: true,
        logoSize: 30,
        headerText: null,
        showPondokName: true,
        pondokNameSize: 14,
        footerText: null
      },
      pondokProfile: {
        name: "PONDOK PESANTREN TADZIMUSSUNNAH",
        address: "Alamat Pondok",
        phone: "08123456789",
        email: "info@pondok.com",
        website: "www.pondok.com",
        logoUrl: null
      }
    }
  }
}

export async function getAppSettings() {
  try {
    const settings = await prisma.appSettings.findFirst()
    return settings || {
      appName: 'Sistem Pondok',
      logoUrl: null
    }
  } catch (error) {
    console.error("Error fetching app settings:", error)
    return {
      appName: 'Sistem Pondok',
      logoUrl: null
    }
  }
}

export async function updateAppSettings(formData: FormData) {
  try {
    const appName = formData.get('appName') as string
    const logoUrl = formData.get('logoUrl') as string

    const existing = await prisma.appSettings.findFirst()

    if (existing) {
      await prisma.appSettings.update({
        where: { id: existing.id },
        data: {
          appName,
          logoUrl: logoUrl || null
        }
      })
    } else {
      await prisma.appSettings.create({
        data: {
          appName,
          logoUrl: logoUrl || null
        }
      })
    }

    return { success: true }
  } catch (error) {
    console.error("Error updating app settings:", error)
    return { success: false, error: "Gagal menyimpan pengaturan" }
  }
}

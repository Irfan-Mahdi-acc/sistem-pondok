'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getPondokProfile() {
  try {
    // Get first (and should be only) pondok profile
    let profile = await prisma.pondokProfile.findFirst()
    
    // If no profile exists, create default one
    if (!profile) {
      profile = await prisma.pondokProfile.create({
        data: {
          name: "Pondok Pesantren",
          address: null,
          phone: null,
          email: null,
          website: null,
          logoUrl: null,
          description: null,
        }
      })
    }
    
    return profile
  } catch (error) {
    console.error('Get pondok profile error:', error)
    throw new Error('Failed to get pondok profile')
  }
}

export async function updatePondokProfile(formData: FormData) {
  try {
    const name = formData.get('name') as string
    const address = formData.get('address') as string
    const phone = formData.get('phone') as string
    const email = formData.get('email') as string
    const website = formData.get('website') as string
    const logoUrl = formData.get('logoUrl') as string
    const description = formData.get('description') as string

    // Get existing profile
    const existing = await prisma.pondokProfile.findFirst()

    if (existing) {
      // Update existing
      await prisma.pondokProfile.update({
        where: { id: existing.id },
        data: {
          name: name || "Pondok Pesantren",
          address: address || null,
          phone: phone || null,
          email: email || null,
          website: website || null,
          logoUrl: logoUrl || null,
          description: description || null,
        }
      })
    } else {
      // Create new
      await prisma.pondokProfile.create({
        data: {
          name: name || "Pondok Pesantren",
          address: address || null,
          phone: phone || null,
          email: email || null,
          website: website || null,
          logoUrl: logoUrl || null,
          description: description || null,
        }
      })
    }

    revalidatePath('/dashboard/settings')
    return { success: true }
  } catch (error) {
    console.error('Update pondok profile error:', error)
    return { success: false, error: 'Failed to update pondok profile' }
  }
}

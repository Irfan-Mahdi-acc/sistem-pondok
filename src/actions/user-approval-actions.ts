'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function approveUser(userId: string, role: string) {
  try {
    const session = await auth()
    
    // Check if approver is admin/superadmin
    // Note: Adjust checks based on your actual permission system
    const approverRole = session?.user?.role
    if (approverRole !== 'ADMIN' && approverRole !== 'SUPERADMIN') {
      return { success: false, error: "Unauthorized" }
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        role: role,
        isApproved: true,
        approvedAt: new Date(),
        approvedBy: session?.user?.id
      }
    })

    revalidatePath('/dashboard/user-registrations')
    return { success: true }
  } catch (error) {
    console.error("Error approving user:", error)
    return { success: false, error: "Failed to approve user" }
  }
}

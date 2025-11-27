'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const RoleSchema = z.object({
  name: z.string().min(3),
  permissions: z.array(z.string()),
})

export async function getRoles() {
  return await prisma.role.findMany({
    include: {
      permissions: {
        include: {
          permission: true
        }
      }
    }
  })
}

export async function createRole(formData: FormData) {
  const name = formData.get('name') as string
  const permissions = formData.getAll('permissions') as string[]

  try {
    // Create the role
    const role = await prisma.role.create({
      data: {
        name,
      },
    })

    // Create permissions if they don't exist and link them
    for (const permId of permissions) {
      // Ensure permission exists in DB
      let permission = await prisma.permission.findFirst({
        where: { action: 'manage', resource: permId }
      })

      if (!permission) {
        permission = await prisma.permission.create({
          data: { action: 'manage', resource: permId }
        })
      }

      // Link to role
      await prisma.rolePermission.create({
        data: {
          roleId: role.id,
          permissionId: permission.id
        }
      })
    }

    revalidatePath('/dashboard/roles')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Failed to create role' }
  }
}

export async function deleteRole(id: string) {
  try {
    // Delete role permissions first
    await prisma.rolePermission.deleteMany({
      where: { roleId: id }
    })
    
    await prisma.role.delete({
      where: { id },
    })
    revalidatePath('/dashboard/roles')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete role' }
  }
}

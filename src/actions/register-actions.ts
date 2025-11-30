'use server'

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const registerSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Email tidak valid"),
  username: z.string().min(3, "Username minimal 3 karakter").regex(/^[a-zA-Z0-9_]+$/, "Username hanya boleh huruf, angka, dan underscore"),
  password: z.string().min(6, "Password minimal 6 karakter"),
})

export async function registerUser(
  prevState: { success: boolean; message?: string; error?: string } | undefined,
  formData: FormData
) {
  try {
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      username: formData.get('username') as string,
      password: formData.get('password') as string,
    }

    // Validate
    const validated = registerSchema.parse(data)

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: validated.email }
    })

    if (existingEmail) {
      return { success: false, error: 'Email sudah terdaftar' }
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username: validated.username }
    })

    if (existingUsername) {
      return { success: false, error: 'Username sudah digunakan' }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validated.password, 10)

    // Create user with PENDING status
    await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        username: validated.username,
        password: hashedPassword,
        role: 'PENDING',
        isApproved: false,
      }
    })

    return { 
      success: true, 
      message: 'Pendaftaran berhasil! Akun Anda menunggu persetujuan admin.' 
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    console.error('Registration error:', error)
    return { success: false, error: 'Terjadi kesalahan saat mendaftar' }
  }
}

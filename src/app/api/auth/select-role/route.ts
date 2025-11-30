import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { parseRoles } from '@/lib/role-utils'

export async function POST(request: NextRequest) {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const formData = await request.formData()
  const selectedRole = formData.get('role') as string

  console.log('Role selected:', selectedRole)

  // Verify user has this role (PostgreSQL compatible)
  // @ts-ignore
  let roles = parseRoles(session.user.roles) || [session.user.role || 'SANTRI']

  // Fallback: If roles is empty, fetch from database
  if (roles.length === 0 && session.user.id) {
    try {
      const { prisma } = await import('@/lib/prisma')
      const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { roles: true, role: true }
      })
      
      if (dbUser) {
        roles = parseRoles(dbUser.roles) || [dbUser.role || 'SANTRI']
        console.log('Fetched roles from database for verification:', roles)
      }
    } catch (error) {
      console.error('Error fetching roles from database:', error)
      roles = [session.user.role || 'SANTRI']
    }
  }

  if (!roles.includes(selectedRole)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  // Store selected role in session/cookie
  const response = NextResponse.redirect(new URL('/dashboard', request.url))
  response.cookies.set('selected-role', selectedRole, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  console.log('Redirecting to dashboard with role:', selectedRole)
  console.log('Cookie set for selected-role:', selectedRole)

  return response
}

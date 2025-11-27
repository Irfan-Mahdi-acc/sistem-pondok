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
  const roles = parseRoles(session.user.roles) || [session.user.role || 'SANTRI']

  if (!roles.includes(selectedRole)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  // Store selected role in session/cookie
  // Fix URL to use localhost instead of 0.0.0.0
  const correctedUrl = request.url.replace('0.0.0.0', 'localhost')
  const response = NextResponse.redirect(new URL('/dashboard', correctedUrl))
  response.cookies.set('selected-role', selectedRole, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  console.log('Redirecting to dashboard with role:', selectedRole)
  console.log('Cookie set for selected-role:', selectedRole)
  console.log('Redirect URL:', correctedUrl)

  return response
}

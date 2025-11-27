import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function POST(request: NextRequest) {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const formData = await request.formData()
  const selectedRole = formData.get('role') as string

  console.log('Role selected:', selectedRole)

  // Verify user has this role
  let roles: string[] = []
  try {
    // @ts-ignore
    roles = session.user.roles ? JSON.parse(session.user.roles) : [session.user.role || 'SANTRI']
  } catch {
    // @ts-ignore
    roles = [session.user.role || 'SANTRI']
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
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  console.log('Redirecting to dashboard with role:', selectedRole)

  return response
}

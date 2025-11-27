import { NextRequest, NextResponse } from 'next/server'
import { signOut } from '@/auth'

export async function POST(request: NextRequest) {
  // Clear selected-role cookie
  const response = NextResponse.redirect(new URL('/login', request.url))
  response.cookies.set('selected-role', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // Delete immediately
  })

  return response
}


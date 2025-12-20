import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  try {
    const { pathname } = req.nextUrl
    const isLoggedIn = !!req.auth
    const user = req.auth?.user

    // Check for API Key authentication on API routes
    const isApiRoute = pathname.startsWith('/api/lembaga') || 
                       pathname.startsWith('/api/ustadz') || 
                       pathname.startsWith('/api/santri') || 
                       pathname.startsWith('/api/kelas') || 
                       pathname.startsWith('/api/mapel')
    
    if (isApiRoute) {
      const apiKey = req.headers.get('X-API-Key')
      const validApiKey = process.env.API_SECRET_KEY
      
      // If valid API key is provided, allow access
      if (apiKey && validApiKey && apiKey === validApiKey) {
        return NextResponse.next()
      }
      // If no API key or invalid, return 401 instead of redirecting to login
      if (!apiKey || apiKey !== validApiKey) {
        return NextResponse.json(
          { success: false, error: 'Invalid or missing API Key' },
          { status: 401 }
        )
      }
    }

    // Public routes that don't require authentication
    const publicRoutes = ['/login', '/api/auth', '/register']
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

    // Redirect to login if not authenticated
    if (!isLoggedIn && !isPublicRoute) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Check if user is approved (except for pending-approval page)
    if (isLoggedIn && user && pathname !== '/pending-approval' && pathname !== '/api/auth/signout') {
      // @ts-ignore - isApproved exists but not in type
      if (user.isApproved === false || user.role === 'PENDING') {
        return NextResponse.redirect(new URL('/pending-approval', req.url))
      }
    }

    // Allow access to pending-approval page for unapproved users
    if (pathname === '/pending-approval' && isLoggedIn && user) {
      // @ts-ignore
      if (user.isApproved === true && user.role !== 'PENDING') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    return NextResponse.next()
  } catch (error) {
    // Log error in production
    if (process.env.NODE_ENV === 'production') {
      console.error('Middleware error:', error)
    }
    // Allow request to continue on error to prevent blocking
    return NextResponse.next()
  }
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|uploads).*)'],
}

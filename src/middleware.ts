import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  try {
    const { pathname } = req.nextUrl
    const isLoggedIn = !!req.auth
    const user = req.auth?.user

    // Public routes that don't require authentication
    const publicRoutes = ['/login', '/api/auth']
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

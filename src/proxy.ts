import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth'

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl
  
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup')
  const isPublicApi = pathname.startsWith('/api/auth')
  const isPublicResource = pathname.includes('.') // images, etc

  if (isPublicApi || isPublicResource) {
      return NextResponse.next()
  }

  let user = null
  if (token) {
      user = await verifyToken(token)
  }

  // 1. Protect Home (/) - user must be logged in
  if (pathname === '/') {
      if (!user) {
          return NextResponse.redirect(new URL('/login', request.url))
      }
  }

  // 2. Redirect logged-in user away from Auth pages
  if (isAuthPage) {
      if (user) {
          return NextResponse.redirect(new URL('/', request.url))
      }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

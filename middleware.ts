import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // /direction solo para admin
    if (pathname.startsWith('/direction') && token?.rol !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  },
  {
    callbacks: {
      authorized({ token }) { return !!token },
    },
    pages: { signIn: '/login' },
  }
)

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login|indicacao).*)'],
}

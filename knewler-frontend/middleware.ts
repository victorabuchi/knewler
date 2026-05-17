import { NextRequest, NextResponse } from 'next/server'

const PASSTHROUGH_PREFIXES = [
  '/_next',
  '/api',
  '/public',
  '/login',
  '/register',
  '/join',
  '/auth',
]

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') ?? ''
  const pathname = request.nextUrl.pathname

  const isStudentDomain =
    hostname === 'student.knewler.com' ||
    hostname.startsWith('student.knewler.com:')

  if (isStudentDomain) {
    const passthrough = PASSTHROUGH_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
    )

    if (passthrough || pathname.startsWith('/student')) {
      return NextResponse.next()
    }

    const url = request.nextUrl.clone()
    url.pathname = pathname === '/' || pathname === '/home' ? '/student' : `/student${pathname}`
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

import { NextRequest, NextResponse } from 'next/server'

const AUTH_PREFIXES = [
  '/_next',
  '/api',
  '/public',
  '/login',
  '/register',
  '/join',
  '/auth',
]

function isAuthPath(pathname: string): boolean {
  return AUTH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
  )
}

function rewriteTo(request: NextRequest, base: string, pathname: string): NextResponse {
  const url = request.nextUrl.clone()
  url.pathname = pathname === '/' || pathname === '/home'
    ? base
    : pathname.startsWith(base)
      ? pathname
      : `${base}${pathname}`
  return NextResponse.rewrite(url)
}

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') ?? ''
  const pathname = request.nextUrl.pathname

  // Strip port for matching (handles localhost:3004, subdomains on non-standard ports)
  const host = hostname.split(':')[0]

  // Always pass through auth/asset paths
  if (isAuthPath(pathname)) {
    return NextResponse.next()
  }

  // Local development — pass through
  if (host === 'localhost' || host === '127.0.0.1') {
    return NextResponse.next()
  }

  // knewler.com / www.knewler.com → /marketing
  if (host === 'knewler.com' || host === 'www.knewler.com') {
    if (pathname.startsWith('/marketing')) return NextResponse.next()
    return rewriteTo(request, '/marketing', pathname)
  }

  // app.knewler.com → /dashboard
  if (host === 'app.knewler.com') {
    if (pathname.startsWith('/dashboard')) return NextResponse.next()
    return rewriteTo(request, '/dashboard', pathname)
  }

  // elearn.knewler.com → /elearn
  if (host === 'elearn.knewler.com') {
    if (pathname.startsWith('/elearn')) return NextResponse.next()
    return rewriteTo(request, '/elearn', pathname)
  }

  // student.knewler.com → /student
  if (host === 'student.knewler.com') {
    if (pathname.startsWith('/student')) return NextResponse.next()
    return rewriteTo(request, '/student', pathname)
  }

  // staff.knewler.com → /staff
  if (host === 'staff.knewler.com') {
    if (pathname.startsWith('/staff')) return NextResponse.next()
    return rewriteTo(request, '/staff', pathname)
  }

  // calendar.knewler.com → /calendar
  if (host === 'calendar.knewler.com') {
    if (pathname.startsWith('/calendar')) return NextResponse.next()
    return rewriteTo(request, '/calendar', pathname)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

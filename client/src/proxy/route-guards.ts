import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/employer',
  '/candidate',
  '/worker',
  '/admin',
  '/settings',
  '/profile',
];

const AUTH_PREFIXES = [
  '/auth',
  '/reset-password',
  '/verify-email',
];

export function handleRouteGuards(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.get('hasSession')?.value === 'true';

  const isProtectedRoute = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  const isAuthRoute = AUTH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  // If accessing a protected route without hasSession cookie, redirect to /auth
  if (isProtectedRoute && !hasSession) {
    const loginUrl = new URL('/auth', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing auth routes while having active session, redirect to /dashboard
  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return null; // No redirect needed
}

export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

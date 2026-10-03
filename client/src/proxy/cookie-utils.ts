import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Helper to update or insert a specific cookie in a Cookie header string.
 */
export function updateCookieHeader(cookieHeader: string, name: string, value: string): string {
  const map = new Map<string, string>();
  if (cookieHeader) {
    cookieHeader.split(';').forEach((item) => {
      const idx = item.indexOf('=');
      if (idx !== -1) {
        const k = item.substring(0, idx).trim();
        const v = item.substring(idx + 1).trim();
        if (k) map.set(k, v);
      }
    });
  }
  map.set(name, value);
  return Array.from(map.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');
}

/**
 * Redirects user to /auth and clears all auth cookies to prevent infinite refresh loops.
 */
export function redirectToAuthAndClearCookies(request: NextRequest): NextResponse {
  const loginUrl = new URL('/auth', request.url);
  loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
  const response = NextResponse.redirect(loginUrl);

  // Clear auth cookies to ensure clean state and prevent infinite loops
  response.cookies.delete('access_token');
  response.cookies.delete('refresh_token');
  response.cookies.delete('hasSession');

  return response;
}

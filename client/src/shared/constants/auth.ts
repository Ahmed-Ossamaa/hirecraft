/**
 * Shared authentication cookie names.
 */
export const AUTH_COOKIES = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  HAS_SESSION: 'hasSession',
} as const;

/**
 * Shared authentication cookie maxAge durations in seconds.
 */
export const AUTH_COOKIE_MAX_AGE = {
  ACCESS_TOKEN: 30 * 60, // 30 minutes 
  REFRESH_TOKEN: 7 * 24 * 60 * 60, // 7 days
  HAS_SESSION: 7 * 24 * 60 * 60, // 7 days
} as const;

/**
 * Standard cookie config helper for auth cookies in Next.js Server / BFF routes.
 */
export function getAuthCookieOptions(maxAge: number, httpOnly = true) {
  return {
    httpOnly,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}

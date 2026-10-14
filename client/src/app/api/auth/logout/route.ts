import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIES, getAuthCookieOptions } from '@/shared/constants/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function POST() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIES.ACCESS_TOKEN)?.value;
  const refreshToken = cookieStore.get(AUTH_COOKIES.REFRESH_TOKEN)?.value;

  // Revoke refresh token in database if session exists
  if (accessToken) {
    try {
      await fetch(`${API_URL}/api/v1/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          ...(refreshToken ? { Cookie: `${AUTH_COOKIES.REFRESH_TOKEN}=${refreshToken}` } : {}),
        },
      });
    } catch (err) {
      console.error('Error notifying backend during logout:', err);
    }
  }

  const response = NextResponse.json({ message: 'Logged out successfully' });

  // Delete cookies by setting maxAge to 0
  response.cookies.set(AUTH_COOKIES.ACCESS_TOKEN, '', getAuthCookieOptions(0));
  response.cookies.set(AUTH_COOKIES.REFRESH_TOKEN, '', getAuthCookieOptions(0));
  response.cookies.set(AUTH_COOKIES.HAS_SESSION, '', getAuthCookieOptions(0, false));

  return response;
}

import { NextResponse } from 'next/server';
import {
  AUTH_COOKIES,
  AUTH_COOKIE_MAX_AGE,
  getAuthCookieOptions,
} from '@/shared/constants/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    const authData = data.data ? data.data : data;
    const { accessToken, user } = authData;

    const nextResponse = NextResponse.json({ user, accessToken });

    // Extract refresh token from Backend Set-Cookie header
    const setCookieHeader = response.headers.get('set-cookie');
    let refreshToken = '';
    if (setCookieHeader) {
      const match = setCookieHeader.match(/refresh_token=([^;]+)/);
      if (match) {
        refreshToken = match[1];
      }
    }

    // Set the three cookies on the Next.js domain
    if (accessToken) {
      nextResponse.cookies.set(
        AUTH_COOKIES.ACCESS_TOKEN,
        accessToken,
        getAuthCookieOptions(AUTH_COOKIE_MAX_AGE.ACCESS_TOKEN)
      );
    }

    if (refreshToken) {
      nextResponse.cookies.set(
        AUTH_COOKIES.REFRESH_TOKEN,
        refreshToken,
        getAuthCookieOptions(AUTH_COOKIE_MAX_AGE.REFRESH_TOKEN)
      );
    }

    nextResponse.cookies.set(
      AUTH_COOKIES.HAS_SESSION,
      'true',
      getAuthCookieOptions(AUTH_COOKIE_MAX_AGE.HAS_SESSION, false)
    );

    return nextResponse;
  } catch (error) {
    console.error('BFF Login Error:', error);
    return NextResponse.json(
      { message: 'Internal server error during login' },
      { status: 500 }
    );
  }
}

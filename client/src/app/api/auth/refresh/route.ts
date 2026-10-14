import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  AUTH_COOKIES,
  AUTH_COOKIE_MAX_AGE,
  getAuthCookieOptions,
} from '@/shared/constants/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(AUTH_COOKIES.REFRESH_TOKEN)?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: 'No refresh token' }, { status: 401 });
  }

  try {
    const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `${AUTH_COOKIES.REFRESH_TOKEN}=${refreshToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    const authData = data.data ? data.data : data;
    const { accessToken } = authData;

    if (!accessToken) {
      return NextResponse.json({ message: 'Invalid response from backend' }, { status: 500 });
    }

    const nextResponse = NextResponse.json(authData);

    // Set new access_token cookie
    nextResponse.cookies.set(
      AUTH_COOKIES.ACCESS_TOKEN,
      accessToken,
      getAuthCookieOptions(AUTH_COOKIE_MAX_AGE.ACCESS_TOKEN)
    );

    // Check if backend returned a new refresh_token in headers
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      const refreshTokenMatch = setCookieHeader.match(/refresh_token=([^;]+)/);
      if (refreshTokenMatch && refreshTokenMatch[1]) {
        nextResponse.cookies.set(
          AUTH_COOKIES.REFRESH_TOKEN,
          refreshTokenMatch[1],
          getAuthCookieOptions(AUTH_COOKIE_MAX_AGE.REFRESH_TOKEN)
        );
      }
    }

    return nextResponse;
  } catch (error) {
    console.error('BFF Refresh Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: 'No refresh token' }, { status: 401 });
  }

  try {
    const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `refresh_token=${refreshToken}`,
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
    nextResponse.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days (or match token expiry)
    });

    // Check if backend returned a new refresh_token in headers
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      const refreshTokenMatch = setCookieHeader.match(/refresh_token=([^;]+)/);
      if (refreshTokenMatch && refreshTokenMatch[1]) {
        nextResponse.cookies.set('refresh_token', refreshTokenMatch[1], {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 30 * 24 * 60 * 60, // 30 days
        });
      }
    }

    return nextResponse;
  } catch (error) {
    console.error('BFF Refresh Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

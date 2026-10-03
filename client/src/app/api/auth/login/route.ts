import { NextResponse } from 'next/server';

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
      nextResponse.cookies.set('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });
    }

    if (refreshToken) {
      nextResponse.cookies.set('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });
    }

    nextResponse.cookies.set('hasSession', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return nextResponse;
  } catch (error) {
    console.error('BFF Login Error:', error);
    return NextResponse.json(
      { message: 'Internal server error during login' },
      { status: 500 }
    );
  }
}

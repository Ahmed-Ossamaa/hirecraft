import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isTokenExpired } from './jwt-utils';
import { updateCookieHeader, redirectToAuthAndClearCookies } from './cookie-utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Attempts to silently refresh the access token if needed.
 * @returns a NextResponse if the request is successfully refreshed or needs to redirect to auth.
 * @returns null if the token is still valid and no refresh is needed.
 */
export async function handleSilentRefresh(request: NextRequest): Promise<NextResponse | null> {
  const accessToken = request.cookies.get('access_token')?.value;

  // If access_token exists and is NOT expired, proceed without refreshing
  if (accessToken && !isTokenExpired(accessToken)) {
    return null;
  }

  // Access token is missing or expired -> attempt refresh using refresh_token
  const refreshToken = request.cookies.get('refresh_token')?.value;

  if (!refreshToken) {
    return redirectToAuthAndClearCookies(request);
  }

  try {
    const refreshRes = await fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `refresh_token=${refreshToken}`,
      },
    });

    if (!refreshRes.ok) {
      console.warn(`[Proxy] Refresh token rejected with status ${refreshRes.status}`);
      return redirectToAuthAndClearCookies(request);
    }

    const data = await refreshRes.json();
    const authData = data.data ? data.data : data;
    const newAccessToken = authData.accessToken;

    if (!newAccessToken) {
      console.error('[Proxy] Refresh response missing accessToken');
      return redirectToAuthAndClearCookies(request);
    }

    // Check if backend rotated the refresh token in Set-Cookie header
    let newRefreshToken = refreshToken;
    const setCookieHeader = refreshRes.headers.get('set-cookie');
    if (setCookieHeader) {
      const match = setCookieHeader.match(/refresh_token=([^;]+)/);
      if (match && match[1]) {
        newRefreshToken = match[1];
      }
    }

    //  Prepare request headers
    const requestHeaders = new Headers(request.headers);
    let cookieHeaderString = request.headers.get('cookie') || '';
    cookieHeaderString = updateCookieHeader(cookieHeaderString, 'access_token', newAccessToken);
    if (newRefreshToken !== refreshToken) {
      cookieHeaderString = updateCookieHeader(cookieHeaderString, 'refresh_token', newRefreshToken);
    }
    cookieHeaderString = updateCookieHeader(cookieHeaderString, 'hasSession', 'true');
    requestHeaders.set('cookie', cookieHeaderString);

    // Create response with updated request headers for current SSR render
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    // Set cookies on response for client browser persistence
    const isProduction = process.env.NODE_ENV === 'production';

    response.cookies.set('access_token', newAccessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    if (newRefreshToken !== refreshToken) {
      response.cookies.set('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60,
      });
    }

    response.cookies.set('hasSession', 'true', {
      httpOnly: false,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('[Proxy] Error during silent refresh:', error);
    return redirectToAuthAndClearCookies(request);
  }
}

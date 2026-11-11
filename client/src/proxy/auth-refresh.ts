import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isTokenExpired } from './jwt-utils';
import { updateCookieHeader, redirectToAuthAndClearCookies } from './cookie-utils';
import {
  AUTH_COOKIES,
  AUTH_COOKIE_MAX_AGE,
  getAuthCookieOptions,
} from '@/shared/constants/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Attempts to silently refresh the access token if needed.
 * @returns a NextResponse if the request is successfully refreshed or needs to redirect to auth.
 * @returns null if the token is still valid and no refresh is needed.
 */
export async function handleSilentRefresh(request: NextRequest): Promise<NextResponse | null> {
  const accessToken = request.cookies.get(AUTH_COOKIES.ACCESS_TOKEN)?.value;

  // If access_token exists and is NOT expired, proceed without refreshing
  if (accessToken && !isTokenExpired(accessToken)) {
    return null;
  }

  // Access token is missing or expired -> attempt refresh using refresh_token
  const refreshToken = request.cookies.get(AUTH_COOKIES.REFRESH_TOKEN)?.value;

  if (!refreshToken) {
    return redirectToAuthAndClearCookies(request);
  }

  try {
    const refreshRes = await fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `${AUTH_COOKIES.REFRESH_TOKEN}=${refreshToken}`,
      },
    });

    if (!refreshRes.ok) {
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

    // Prepare request headers
    const requestHeaders = new Headers(request.headers);
    let cookieHeaderString = request.headers.get('cookie') || '';
    cookieHeaderString = updateCookieHeader(cookieHeaderString, AUTH_COOKIES.ACCESS_TOKEN, newAccessToken);
    if (newRefreshToken !== refreshToken) {
      cookieHeaderString = updateCookieHeader(cookieHeaderString, AUTH_COOKIES.REFRESH_TOKEN, newRefreshToken);
    }
    cookieHeaderString = updateCookieHeader(cookieHeaderString, AUTH_COOKIES.HAS_SESSION, 'true');
    requestHeaders.set('cookie', cookieHeaderString);

    // Create response with updated request headers for current SSR render
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    // Set cookies on response for client browser persistence
    response.cookies.set(
      AUTH_COOKIES.ACCESS_TOKEN,
      newAccessToken,
      getAuthCookieOptions(AUTH_COOKIE_MAX_AGE.ACCESS_TOKEN)
    );

    if (newRefreshToken !== refreshToken) {
      response.cookies.set(
        AUTH_COOKIES.REFRESH_TOKEN,
        newRefreshToken,
        getAuthCookieOptions(AUTH_COOKIE_MAX_AGE.REFRESH_TOKEN)
      );
    }

    response.cookies.set(
      AUTH_COOKIES.HAS_SESSION,
      'true',
      getAuthCookieOptions(AUTH_COOKIE_MAX_AGE.HAS_SESSION, false)
    );

    return response;
  } catch (error) {
    console.error(
      '[Proxy] Silent refresh failed',
      error instanceof Error ? error.name : 'Unknown error',
    );
    return redirectToAuthAndClearCookies(request);
  }
}

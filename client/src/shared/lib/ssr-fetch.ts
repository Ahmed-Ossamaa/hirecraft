import { cookies } from 'next/headers';
import { AUTH_COOKIES } from '@/shared/constants/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function fetchServer<T>(endpoint: string, init?: RequestInit): Promise<T | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIES.ACCESS_TOKEN)?.value;

  const headers = new Headers(init?.headers);
  if (token) {
    headers.set('Cookie', `${AUTH_COOKIES.ACCESS_TOKEN}=${token}`);
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...init,
      headers,
    });
    
    if (!res.ok) {
      if (res.status >= 500) {
        console.error('[SSR Fetch] Upstream server error', res.status);
      }
      return null;
    }
    
    const data = await res.json();
    return data as T;
  } catch (error) {
    console.error(
      '[SSR Fetch] Request failed',
      error instanceof Error ? error.name : 'Unknown error',
    );
    return null;
  }
}

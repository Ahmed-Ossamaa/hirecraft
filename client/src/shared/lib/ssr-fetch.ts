import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function fetchServer<T>(endpoint: string, init?: RequestInit): Promise<T | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  const headers = new Headers(init?.headers);
  if (token) {
    headers.set('Cookie', `access_token=${token}`);
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...init,
      headers,
    });
    
    if (!res.ok) {
      console.error(`SSR Fetch Error for ${endpoint}: ${res.status} ${res.statusText}`);
      return null;
    }
    
    const data = await res.json();
    return data as T;
  } catch (error) {
    console.error(`SSR Fetch Error forrr ${endpoint}:`, error);
    return null;
  }
}

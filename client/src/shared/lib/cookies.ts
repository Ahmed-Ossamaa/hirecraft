import Cookies from 'js-cookie';

export function setClientCookie(name: string, value: string, days = 7): void {
  Cookies.set(name, value, { expires: days, path: '/', sameSite: 'Lax' });
}

export function getClientCookie(name: string): string | null {
  return Cookies.get(name) ?? null;
}

export function removeClientCookie(name: string): void {
  Cookies.remove(name, { path: '/' });
}

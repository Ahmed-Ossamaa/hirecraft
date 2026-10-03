/**
 * Parses JWT and returns the expiration timestamp (exp) in seconds, or null if invalid.
 */
export function getJwtExpiration(token: string): number | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = atob(base64);
    const parsed = JSON.parse(jsonPayload);

    return typeof parsed.exp === 'number' ? parsed.exp : null;
  } catch {
    return null;
  }
}

/**
 * Checks if a JWT is expired or will expire within seconds (default 30s)
 */
export function isTokenExpired(token: string, bufferSeconds = 30): boolean {
  const exp = getJwtExpiration(token);
  if (!exp) return true;
  return exp < Math.floor(Date.now() / 1000) + bufferSeconds;
}

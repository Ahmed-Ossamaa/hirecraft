interface AuthTokenClaims {
  companyId: string | null;
  role: string | null;
}

export function getAuthTokenClaims(token: string): AuthTokenClaims {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return { companyId: null, role: null };
    }

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload: unknown = JSON.parse(atob(base64));
    if (typeof payload !== "object" || payload === null) {
      return { companyId: null, role: null };
    }

    const claims = payload as Record<string, unknown>;
    return {
      companyId: typeof claims.companyId === "string" ? claims.companyId : null,
      role: typeof claims.role === "string" ? claims.role : null,
    };
  } catch {
    return { companyId: null, role: null };
  }
}

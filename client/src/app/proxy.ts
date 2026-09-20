import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication (private)
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/employer",
  "/candidate",
  "/worker",
  "/admin",
  "/settings",
  "/profile",
];

// Routes accessible only to unauthenticated visitors
const AUTH_PREFIXES = [
  "/auth",
  "/reset-password",
  "/verify-email",
];


export function proxyMiddleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.get("hasSession")?.value === "true";

  const isProtectedRoute = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  const isAuthRoute = AUTH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  // If accessing a protected route without hasSession cookie, redirect to /auth
  if (isProtectedRoute && !hasSession) {
    const loginUrl = new URL("/auth", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing auth routes while having active session, redirect to /dashboard
  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export default proxyMiddleware;

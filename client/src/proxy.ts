import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { handleRouteGuards, isProtectedRoute } from "./proxy/route-guards";
import { handleSilentRefresh } from "./proxy/auth-refresh";

export async function proxy(request: NextRequest) {
  // Basic Route Guards (ex: redirecting away from /auth if logged in)
  const guardResponse = handleRouteGuards(request);
  if (guardResponse) {
    return guardResponse;
  }

  // If it is a protected route, ensure token is fresh
  if (isProtectedRoute(request.nextUrl.pathname)) {
    const refreshResponse = await handleSilentRefresh(request);
    if (refreshResponse) {
      return refreshResponse; // Return the response with refreshed tokens or redirect
    }
  }

  //  Otherwise, proceed normally
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

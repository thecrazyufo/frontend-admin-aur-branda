import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const startTime = Date.now();
  
  // Generate transient request ID for tracing Page requests
  const requestId = "page-" + Math.random().toString(36).substring(2, 11) + "-" + Date.now().toString(36);

  console.log(`[NextJS ROUTE REQUEST] [ID: ${requestId}] ${request.method} ${pathname}`);

  // Protect all /admin routes except /admin/login
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = request.cookies.get("admin_jwt")?.value;

    if (!token) {
      console.warn(`[NextJS ROUTE BLOCKED] [ID: ${requestId}] Unauthorized access attempt to ${pathname}. Redirecting to /admin/login.`);
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect all /licensing routes except /licensing/login
  if (pathname.startsWith("/licensing") && !pathname.startsWith("/licensing/login")) {
    const token = request.cookies.get("admin_jwt")?.value;

    if (!token) {
      console.warn(`[NextJS ROUTE BLOCKED] [ID: ${requestId}] Unauthorized access attempt to ${pathname}. Redirecting to /licensing/login.`);
      const loginUrl = new URL("/licensing/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = NextResponse.next();
  // Set tracking headers on the response
  response.headers.set("X-Correlation-ID", requestId);
  
  const duration = Date.now() - startTime;
  console.log(`[NextJS ROUTE RESPONSE] [ID: ${requestId}] Finished ${pathname} in ${duration}ms`);

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/licensing/:path*"],
};

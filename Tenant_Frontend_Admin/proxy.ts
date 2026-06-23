import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Named "proxy" export for Next.js 16+ (replaces old "middleware" convention)
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin routes except /admin/login
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = request.cookies.get("admin_jwt")?.value;

    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect all /licensing routes except /licensing/login
  if (pathname.startsWith("/licensing") && !pathname.startsWith("/licensing/login")) {
    const token = request.cookies.get("admin_jwt")?.value;

    if (!token) {
      const loginUrl = new URL("/licensing/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Also export as default for compatibility
export default proxy;

export const config = {
  matcher: ["/admin/:path*", "/licensing/:path*"],
};


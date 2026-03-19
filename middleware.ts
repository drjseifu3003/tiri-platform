import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth-constants";

const PUBLIC_API_PATHS = [
  "/api/auth/login",
  "/api/public/bookings",
];

function isPublicApiPath(pathname: string) {
  return PUBLIC_API_PATHS.some((publicPath) => pathname === publicPath || pathname.startsWith(`${publicPath}/`));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host');

  // Subdomain extraction logic
  let subdomain = null;
  if (host) {
    const parts = host.split('.');
    if (parts.length > 2) {
      subdomain = parts[0];
    }
  }

  // Ignore root domain and www
  if (subdomain && subdomain !== 'www' && subdomain !== 'yourplatform') {
    // Only rewrite for non-API, non-static, non-studio paths
    if (!pathname.startsWith('/api/') && !pathname.startsWith('/studio/')) {
      return NextResponse.rewrite(new URL(`/wedding/${subdomain}`, request.url));
    }
  }

  if (pathname.startsWith("/api/") && isPublicApiPath(pathname)) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|static|favicon.ico).*)"],
};

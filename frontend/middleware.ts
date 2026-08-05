import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/", "/login"];
const apiAuthRoutes = ["/api/auth"];
const publicAssets = ["/favicon.ico", "/logo.png"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    publicRoutes.includes(pathname) ||
    apiAuthRoutes.includes(pathname) ||
    pathname.startsWith("/_next") ||
    publicAssets.includes(pathname)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("better-auth.session_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};

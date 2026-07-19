import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "jwt";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const authToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = Boolean(authToken);

  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/my-clubs") ||
    pathname.startsWith("/profile") ||
    pathname.endsWith("/manage") ||
    pathname.endsWith("/discussion") ||
    pathname.endsWith("/members") ||
    pathname.endsWith("/reading");
  const isAuthRoute =
    pathname.startsWith("/auth/login") || pathname.startsWith("/auth/signup");

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("returnTo", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/my-clubs/:path*",
    "/profile/:path*",
    "/clubs/:path*/discussion",
    "/clubs/:path*/members",
    "/clubs/:path*/reading",
    "/clubs/:path*/manage",
    "/auth/login",
    "/auth/signup",
  ],
};

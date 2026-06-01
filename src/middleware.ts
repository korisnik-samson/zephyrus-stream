import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Route protection middleware.
 * - /admin/**  → requires an authenticated user with role ADMIN
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    const user = req.auth?.user as { role?: string } | undefined;

    // Not signed in → redirect to login
    if (!req.auth) {
      const loginUrl = new URL("/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Signed in but not an admin → bounce home
    if (user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.nextUrl.origin));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
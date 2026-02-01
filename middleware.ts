import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/adminAuth";

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Protect /admin (except login).
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const authed = req.cookies.get(ADMIN_COOKIE)?.value === "1";
    if (!authed) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.searchParams.set("next", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};


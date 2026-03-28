import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { ADMIN_COOKIE } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const username = String(form.get("username") ?? "");
  const password = String(form.get("password") ?? "");
  const nextPath = String(form.get("next") ?? "/admin/models");

  const expectedUser = process.env.ADMIN_USERNAME ?? "";
  const expectedPass = process.env.ADMIN_PASSWORD ?? "";

  const ok = username === expectedUser && password === expectedPass;

  if (!ok) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("error", "1");
    url.searchParams.set("next", nextPath);
    // 303 forces the browser to follow with GET (prevents POST -> /admin/login => 405)
    return NextResponse.redirect(url, 303);
  }

  // Same idea: after POST, redirect to the admin page with a GET.
  const res = NextResponse.redirect(new URL(nextPath, req.url), 303);
  res.cookies.set({
    name: ADMIN_COOKIE,
    value: "1",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });
  return res;
}


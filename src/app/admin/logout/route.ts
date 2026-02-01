import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { ADMIN_COOKIE } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/admin/login", req.url));
  res.cookies.set({
    name: ADMIN_COOKIE,
    value: "",
    expires: new Date(0),
    path: "/"
  });
  return res;
}


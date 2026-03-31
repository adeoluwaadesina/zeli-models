import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/adminAuth";
import type { SiteSettings } from "@/data/siteSettings";
import { mergeSiteSettings, readSiteSettings, writeSiteSettings } from "@/lib/siteSettingsStore";

export const runtime = "nodejs";

function isAuthed(req: NextRequest) {
  return req.cookies.get(ADMIN_COOKIE)?.value === "1";
}

function isSiteSettings(x: unknown): x is SiteSettings {
  if (!x || typeof x !== "object") return false;
  const s = x as SiteSettings;
  return (
    Array.isArray(s.marqueeCategories) &&
    s.marqueeCategories.every((t) => typeof t === "string") &&
    Array.isArray(s.whatWeDo) &&
    Array.isArray(s.ourValues) &&
    typeof s.instagramUrl === "string" &&
    typeof s.tiktokUrl === "string" &&
    typeof s.twitterUrl === "string"
  );
}

export async function GET(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const settings = await readSiteSettings();
  return NextResponse.json({ settings });
}

export async function PUT(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as unknown;
  const incoming = (body as { settings?: unknown })?.settings;
  if (!isSiteSettings(incoming)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const merged = mergeSiteSettings(incoming);
  await writeSiteSettings(merged);
  return NextResponse.json({ ok: true });
}

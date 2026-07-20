import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

const BOT_UA =
  /bot|crawl|spider|slurp|curl|wget|python|axios|headless|lighthouse|pingdom|monitor|preview|facebookexternalhit|whatsapp|telegram|vercel-screenshot/i;

function classify(path: string): { pageType: string; modelId: string | null } {
  if (path === "/") return { pageType: "home", modelId: null };
  if (path === "/women") return { pageType: "women", modelId: null };
  if (path === "/men") return { pageType: "men", modelId: null };
  if (path === "/book-a-model") return { pageType: "booking", modelId: null };
  if (path === "/become-a-model") return { pageType: "apply", modelId: null };
  const model = path.match(/^\/models\/([^/]+)$/);
  if (model) return { pageType: "model", modelId: decodeURIComponent(model[1]).slice(0, 80) };
  return { pageType: "other", modelId: null };
}

function deviceFromUa(ua: string): string {
  if (/ipad|tablet/i.test(ua)) return "tablet";
  if (/mobi|iphone|android/i.test(ua)) return "mobile";
  return "desktop";
}

function referrerHost(raw: string, ownHost: string | null): string | null {
  if (!raw) return null;
  try {
    const host = new URL(raw).hostname.replace(/^www\./, "");
    if (!host) return null;
    if (ownHost && host === ownHost.replace(/^www\./, "")) return null;
    return host.slice(0, 120);
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const o = body as Record<string, unknown>;
  const path = String(o.path ?? "").slice(0, 200);
  const referrerRaw = String(o.referrer ?? "").slice(0, 500);

  if (!path.startsWith("/") || path.startsWith("/admin") || path.startsWith("/api")) {
    return NextResponse.json({ ok: true });
  }

  const ua = req.headers.get("user-agent") || "";
  if (!ua || BOT_UA.test(ua)) {
    return NextResponse.json({ ok: true });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ ok: true });
  }

  const ip =
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "";
  // Vercel geolocates the request edge-side; the city header is percent-encoded.
  const cityRaw = req.headers.get("x-vercel-ip-city");
  let city: string | null = null;
  if (cityRaw) {
    try {
      city = decodeURIComponent(cityRaw).slice(0, 120);
    } catch {
      city = cityRaw.slice(0, 120);
    }
  }
  const country = req.headers.get("x-vercel-ip-country")?.slice(0, 8) || null;

  // Daily-rotating salted hash: counts unique visitors without storing anything identifying.
  const day = new Date().toISOString().slice(0, 10);
  const salt = process.env.ANALYTICS_SALT || process.env.SUPABASE_URL || "zeli";
  const visitorHash = createHash("sha256").update(`${salt}|${day}|${ip}|${ua}`).digest("hex");

  const { pageType, modelId } = classify(path);

  const { error } = await supabase.from("page_views").insert({
    path,
    page_type: pageType,
    model_id: modelId,
    country,
    city,
    device: deviceFromUa(ua),
    referrer: referrerHost(referrerRaw, req.headers.get("host")),
    visitor_hash: visitorHash
  });

  if (error) {
    console.error("[api/track]", error.message);
  }
  return NextResponse.json({ ok: true });
}

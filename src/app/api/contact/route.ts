import { NextResponse } from "next/server";
import {
  CONTACT_MESSAGE_MAX_WORDS,
  digitsOnly,
  isValidPhoneDigits,
  isWithinWordLimit
} from "@/lib/formValidation";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const o = body as Record<string, unknown>;
  const fullName = String(o.fullName ?? "").trim();
  const email = String(o.email ?? "").trim();
  const phoneRaw = String(o.phone ?? "").trim();
  const phone = digitsOnly(phoneRaw);
  const company = String(o.company ?? "").trim();
  const message = String(o.message ?? "").trim();

  if (!fullName || !email || !phoneRaw || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!isValidPhoneDigits(phoneRaw)) {
    return NextResponse.json(
      { error: "Phone must be 10–15 digits (numbers only)." },
      { status: 400 }
    );
  }
  if (!isWithinWordLimit(message, CONTACT_MESSAGE_MAX_WORDS)) {
    return NextResponse.json(
      { error: `Message must be ${CONTACT_MESSAGE_MAX_WORDS} words or fewer.` },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Submissions are not configured (Supabase service role missing)" },
      { status: 503 }
    );
  }

  const { error } = await supabase.from("contact_submissions").insert({
    full_name: fullName,
    email,
    phone: phone,
    company,
    message
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

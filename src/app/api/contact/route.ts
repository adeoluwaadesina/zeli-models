import { NextResponse } from "next/server";
import {
  CONTACT_MESSAGE_MAX_WORDS,
  digitsOnly,
  isValidPhoneDigits,
  isWithinWordLimit
} from "@/lib/formValidation";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

const ALLOWED_GENDER_PREF = new Set(["no_preference", "female", "male", "other"]);
const ALLOWED_PROJECT_USAGE = new Set([
  "Website",
  "Social media",
  "Billboard",
  "Other"
]);

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const o = body as Record<string, unknown>;
  const intentRaw = String(o.intent ?? "contact").trim().toLowerCase();
  const isBookIntent = intentRaw === "book";
  const fullName = String(o.fullName ?? "").trim();
  const email = String(o.email ?? "").trim();
  const phoneRaw = String(o.phone ?? "").trim();
  const phone = digitsOnly(phoneRaw);
  const company = String(o.company ?? "").trim();
  const message = String(o.message ?? "").trim();
  const termsAccepted = o.termsAccepted === true;
  const genderPreference = String(o.genderPreference ?? "").trim() || "no_preference";
  const projectType = String(o.projectType ?? "").trim();
  const budgetRange = String(o.budgetRange ?? "").trim();
  const projectDate = String(o.projectDate ?? "").trim();
  const projectLocation = String(o.projectLocation ?? "").trim();
  const projectDuration = String(o.projectDuration ?? "").trim();
  const projectUsage = String(o.projectUsage ?? "").trim();
  const rawTotal = o.modelCountTotal;
  const modelCountTotal =
    typeof rawTotal === "number" && Number.isInteger(rawTotal)
      ? rawTotal
      : typeof rawTotal === "string" && rawTotal.trim() !== ""
        ? Number.parseInt(rawTotal, 10)
        : NaN;

  if (!fullName || !email || !phoneRaw || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (isBookIntent && !termsAccepted) {
    return NextResponse.json({ error: "You must accept the terms and conditions." }, { status: 400 });
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
  if (isBookIntent) {
    if (!Number.isInteger(modelCountTotal) || modelCountTotal < 1 || modelCountTotal > 999) {
      return NextResponse.json(
        { error: "Enter total models needed as a whole number (1–999)." },
        { status: 400 }
      );
    }
    if (!ALLOWED_GENDER_PREF.has(genderPreference)) {
      return NextResponse.json({ error: "Invalid gender preference" }, { status: 400 });
    }
    if (!projectType || !budgetRange || !projectDate || !projectLocation || !projectUsage) {
      return NextResponse.json(
        { error: "Please complete project type, budget, date, location, and usage." },
        { status: 400 }
      );
    }
    if (!ALLOWED_PROJECT_USAGE.has(projectUsage)) {
      return NextResponse.json({ error: "Invalid usage selection." }, { status: 400 });
    }
    const lenCap = 240;
    if (
      projectType.length > lenCap ||
      budgetRange.length > lenCap ||
      projectDate.length > 32 ||
      projectLocation.length > lenCap ||
      projectDuration.length > lenCap ||
      projectUsage.length > lenCap
    ) {
      return NextResponse.json({ error: "A project field is too long." }, { status: 400 });
    }
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Submissions are not configured (Supabase service role missing)" },
      { status: 503 }
    );
  }

  const insertRow = isBookIntent
    ? {
        full_name: fullName,
        email,
        phone: phone,
        company,
        message,
        gender_preference: genderPreference,
        model_count_total: modelCountTotal,
        model_count_female: null,
        model_count_male: null,
        terms_accepted: true,
        project_type: projectType,
        budget_range: budgetRange,
        project_date: projectDate,
        project_location: projectLocation,
        project_duration: projectDuration ? projectDuration : null,
        project_usage: projectUsage
      }
    : {
        full_name: fullName,
        email,
        phone: phone,
        company,
        message,
        gender_preference: null,
        model_count_total: null,
        model_count_female: null,
        model_count_male: null,
        terms_accepted: false
      };

  const { error } = await supabase.from("contact_submissions").insert(insertRow);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

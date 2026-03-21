import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { digitsOnly, isValidPhoneDigits } from "@/lib/formValidation";
import { MODELING_INTEREST_OPTIONS } from "@/lib/modelingInterests";
import { getStorageBucket, getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

const MAX_PHOTOS = 6;
const MAX_BYTES = 6 * 1024 * 1024;

const ALLOWED_GENDER = new Set(["female", "male", "other"]);

const INTEREST_KEYS = new Set(MODELING_INTEREST_OPTIONS.map((o) => o.key));

function extFromName(name: string) {
  const e = (name.split(".").pop() || "jpg").slice(0, 6).toLowerCase();
  if (!/^[a-z0-9]+$/.test(e)) return "jpg";
  return e;
}

export async function POST(req: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Applications are not configured (Supabase service role missing)" },
      { status: 503 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const firstName = String(form.get("firstName") ?? "").trim();
  const lastName = String(form.get("lastName") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const phoneRaw = String(form.get("phone") ?? "").trim();
  const phone = digitsOnly(phoneRaw);
  const dob = String(form.get("dob") ?? "").trim();
  const gender = String(form.get("gender") ?? "").trim();
  const country = String(form.get("country") ?? "").trim();
  const state = String(form.get("state") ?? "").trim();
  const city = String(form.get("city") ?? "").trim();
  const heightFeet = Number(String(form.get("heightFeet") ?? "").trim());
  const heightInches = Number(String(form.get("heightInches") ?? "").trim());
  const portfolioLink = String(form.get("portfolioLink") ?? "").trim();
  const interestsOther = String(form.get("interestsOther") ?? "").trim();

  const interests: string[] = [];
  for (const key of INTEREST_KEYS) {
    const v = form.get(`interest_${key}`);
    if (v === "yes" || v === "on" || v === "true" || v === "1") interests.push(key);
  }

  if (!firstName || !lastName || !email || !phoneRaw || !dob || !gender || !country || !state || !city) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!isValidPhoneDigits(phoneRaw)) {
    return NextResponse.json(
      { error: "Phone must be 10–15 digits (numbers only)." },
      { status: 400 }
    );
  }
  if (!ALLOWED_GENDER.has(gender)) {
    return NextResponse.json({ error: "Invalid gender" }, { status: 400 });
  }
  if (!Number.isInteger(heightFeet) || heightFeet < 3 || heightFeet > 8) {
    return NextResponse.json({ error: "Invalid height (feet)" }, { status: 400 });
  }
  if (!Number.isInteger(heightInches) || heightInches < 0 || heightInches > 11) {
    return NextResponse.json({ error: "Invalid height (inches)" }, { status: 400 });
  }
  if (interests.length === 0 && !interestsOther) {
    return NextResponse.json({ error: "Select at least one modeling interest or describe in Other" }, { status: 400 });
  }

  const rawPhotos = form.getAll("photos");
  const files = rawPhotos.filter((x): x is File => x instanceof File && x.size > 0);
  if (files.length === 0) {
    return NextResponse.json({ error: "Please upload at least one photo" }, { status: 400 });
  }
  if (files.length > MAX_PHOTOS) {
    return NextResponse.json({ error: `Maximum ${MAX_PHOTOS} photos` }, { status: 400 });
  }

  for (const f of files) {
    if (!f.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image uploads are allowed" }, { status: 400 });
    }
    if (f.size > MAX_BYTES) {
      return NextResponse.json({ error: "Each image must be 6MB or smaller" }, { status: 400 });
    }
  }

  const id = crypto.randomUUID();
  const bucket = getStorageBucket();

  const photoUrls: string[] = [];
  try {
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const buf = Buffer.from(await f.arrayBuffer());
      const path = `applications/${id}/${i}.${extFromName(f.name)}`;
      const { error: upErr } = await supabase.storage.from(bucket).upload(path, buf, {
        contentType: f.type || "image/jpeg",
        upsert: true
      });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
      photoUrls.push(pub.publicUrl);
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: `Upload failed: ${msg}` }, { status: 500 });
  }

  const { error: insErr } = await supabase.from("model_applications").insert({
    id,
    first_name: firstName,
    last_name: lastName,
    email,
    phone,
    dob,
    gender,
    country,
    state,
    city,
    height_feet: heightFeet,
    height_inches: heightInches,
    portfolio_link: portfolioLink,
    interests,
    interests_other: interestsOther,
    photo_urls: photoUrls,
    status: "new"
  });

  if (insErr) {
    return NextResponse.json({ error: insErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

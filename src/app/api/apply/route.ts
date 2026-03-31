import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { digitsOnly, isValidPhoneDigits } from "@/lib/formValidation";
import { getStorageBucket, getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

const MAX_PHOTOS = 6;
const MAX_BYTES = 6 * 1024 * 1024;

function extFromName(name: string) {
  const e = (name.split(".").pop() || "jpg").slice(0, 6).toLowerCase();
  if (!/^[a-z0-9]+$/.test(e)) return "jpg";
  return e;
}

/** Single height field in feet (e.g. 5.75) -> feet + inches for DB columns. */
function heightFromFeetDecimal(ft: number): { heightFeet: number; heightInches: number } | null {
  if (!Number.isFinite(ft) || ft < 3 || ft > 8) return null;
  const totalInches = Math.round(ft * 12);
  const heightFeet = Math.floor(totalInches / 12);
  const heightInches = totalInches % 12;
  if (heightFeet < 3 || heightFeet > 8) return null;
  return { heightFeet, heightInches };
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
  const ageRaw = Number(String(form.get("age") ?? "").trim());
  const address = String(form.get("applicantAddress") ?? "").trim();
  const heightFtRaw = Number(String(form.get("heightFt") ?? "").trim().replace(",", "."));

  if (!firstName || !lastName || !email || !phoneRaw || !address) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!Number.isInteger(ageRaw) || ageRaw < 16 || ageRaw > 99) {
    return NextResponse.json({ error: "Enter a valid age (16–99)." }, { status: 400 });
  }
  if (!isValidPhoneDigits(phoneRaw)) {
    return NextResponse.json(
      { error: "Phone must be 10–15 digits (numbers only)." },
      { status: 400 }
    );
  }

  const heightParts = heightFromFeetDecimal(heightFtRaw);
  if (!heightParts) {
    return NextResponse.json(
      { error: "Enter height in feet (e.g. 5.9 for 5′9″), between 3 and 8." },
      { status: 400 }
    );
  }
  const { heightFeet, heightInches } = heightParts;

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
    dob: null,
    gender: "other",
    country: "",
    state: "",
    city: "",
    height_feet: heightFeet,
    height_inches: heightInches,
    portfolio_link: "",
    interests: [] as string[],
    interests_other: "",
    photo_urls: photoUrls,
    status: "new",
    applicant_age: ageRaw,
    applicant_address: address
  });

  if (insErr) {
    return NextResponse.json({ error: insErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

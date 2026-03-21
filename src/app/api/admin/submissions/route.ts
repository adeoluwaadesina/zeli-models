import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

function isAuthed(req: NextRequest) {
  return req.cookies.get(ADMIN_COOKIE)?.value === "1";
}

export async function GET(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const [contactsRes, appsRes] = await Promise.all([
    supabase
      .from("contact_submissions")
      .select("id,full_name,email,phone,company,message,read_flag,created_at")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("model_applications")
      .select(
        "id,first_name,last_name,email,phone,dob,gender,country,state,city,height_feet,height_inches,portfolio_link,interests,interests_other,photo_urls,status,created_at"
      )
      .order("created_at", { ascending: false })
      .limit(200)
  ]);

  if (contactsRes.error) return NextResponse.json({ error: contactsRes.error.message }, { status: 500 });
  if (appsRes.error) return NextResponse.json({ error: appsRes.error.message }, { status: 500 });

  return NextResponse.json({
    contacts: contactsRes.data ?? [],
    applications: appsRes.data ?? []
  });
}

export async function PATCH(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const body = (await req.json()) as {
    type?: string;
    id?: string;
    readFlag?: boolean;
    status?: string;
  };

  const type = body.type;
  const id = body.id;
  if (!type || !id) {
    return NextResponse.json({ error: "Missing type or id" }, { status: 400 });
  }

  if (type === "contact") {
    if (typeof body.readFlag !== "boolean") {
      return NextResponse.json({ error: "readFlag required" }, { status: 400 });
    }
    const { error } = await supabase
      .from("contact_submissions")
      .update({ read_flag: body.readFlag })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (type === "application") {
    const status = body.status;
    if (status !== "new" && status !== "reviewed") {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    const { error } = await supabase.from("model_applications").update({ status }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}

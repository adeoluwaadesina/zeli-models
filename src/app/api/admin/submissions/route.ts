import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

const ARCHIVE_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

function isAuthed(req: NextRequest) {
  return req.cookies.get(ADMIN_COOKIE)?.value === "1";
}

async function purgeExpiredArchived(supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>) {
  const cutoff = new Date(Date.now() - ARCHIVE_RETENTION_MS).toISOString();
  const [c, a] = await Promise.all([
    supabase.from("contact_submissions").delete().lt("archived_at", cutoff),
    supabase.from("model_applications").delete().lt("archived_at", cutoff)
  ]);
  if (c.error) console.error("[admin/submissions] purge contacts:", c.error.message);
  if (a.error) console.error("[admin/submissions] purge applications:", a.error.message);
}

export async function GET(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  await purgeExpiredArchived(supabase);

  const showArchived = req.nextUrl.searchParams.get("archived") === "1";

  let contactQuery = supabase
    .from("contact_submissions")
    .select("id,full_name,email,phone,company,message,read_flag,created_at,archived_at")
    .order("created_at", { ascending: false })
    .limit(200);

  let appQuery = supabase
    .from("model_applications")
    .select(
      "id,first_name,last_name,email,phone,dob,gender,country,state,city,height_feet,height_inches,portfolio_link,interests,interests_other,photo_urls,status,created_at,archived_at"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (showArchived) {
    contactQuery = contactQuery.not("archived_at", "is", null);
    appQuery = appQuery.not("archived_at", "is", null);
  } else {
    contactQuery = contactQuery.is("archived_at", null);
    appQuery = appQuery.is("archived_at", null);
  }

  const [contactsRes, appsRes] = await Promise.all([contactQuery, appQuery]);

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
    archived?: boolean;
  };

  const type = body.type;
  const id = body.id;
  if (!type || !id) {
    return NextResponse.json({ error: "Missing type or id" }, { status: 400 });
  }

  if (type === "contact") {
    const updates: Record<string, unknown> = {};
    if (typeof body.readFlag === "boolean") updates.read_flag = body.readFlag;
    if (typeof body.archived === "boolean") {
      updates.archived_at = body.archived ? new Date().toISOString() : null;
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "readFlag and/or archived required" }, { status: 400 });
    }
    const { error } = await supabase.from("contact_submissions").update(updates).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (type === "application") {
    const updates: Record<string, unknown> = {};
    if (body.status === "new" || body.status === "reviewed") updates.status = body.status;
    if (typeof body.archived === "boolean") {
      updates.archived_at = body.archived ? new Date().toISOString() : null;
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "status and/or archived required" }, { status: 400 });
    }
    const { error } = await supabase.from("model_applications").update(updates).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}

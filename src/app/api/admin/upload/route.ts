import { ADMIN_COOKIE } from "@/lib/adminAuth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getStorageBucket, getSupabaseAdmin } from "@/lib/supabase";
import crypto from "node:crypto";

export const runtime = "nodejs";

function isAuthed(req: NextRequest) {
  return req.cookies.get(ADMIN_COOKIE)?.value === "1";
}

function safeSegment(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase not configured (missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)" },
      { status: 500 }
    );
  }

  const body = (await req.json()) as unknown;
  const modelIdRaw = String((body as { modelId?: unknown })?.modelId ?? "");
  const modelId = safeSegment(modelIdRaw);
  const files = (body as { files?: unknown })?.files;

  if (!modelId) return NextResponse.json({ error: "Missing modelId" }, { status: 400 });
  if (!Array.isArray(files) || files.length === 0) {
    return NextResponse.json({ error: "No files" }, { status: 400 });
  }
  if (files.length > 5) return NextResponse.json({ error: "Max 5 files" }, { status: 400 });

  const bucket = getStorageBucket();

  const uploads = await Promise.all(
    files.map(async (f) => {
      const name = String((f as { name?: unknown })?.name ?? "image.jpg");
      const contentType = String((f as { type?: unknown })?.type ?? "image/jpeg");
      const ext = (name.split(".").pop() || "jpg").slice(0, 6).toLowerCase();
      const path = `${modelId}/${crypto.randomUUID()}.${ext}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUploadUrl(path);
      if (error) throw error;

      const publicUrl = supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;

      return {
        signedUrl: data.signedUrl,
        path,
        publicUrl,
        contentType
      };
    })
  );

  return NextResponse.json({ uploads });
}


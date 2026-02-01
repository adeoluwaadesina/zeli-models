import { ADMIN_COOKIE } from "@/lib/adminAuth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import path from "node:path";
import { promises as fs } from "node:fs";

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

  const form = await req.formData();
  const modelIdRaw = String(form.get("modelId") ?? "");
  const modelId = safeSegment(modelIdRaw);
  if (!modelId) return NextResponse.json({ error: "Missing modelId" }, { status: 400 });

  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) return NextResponse.json({ error: "No files" }, { status: 400 });
  if (files.length > 5) return NextResponse.json({ error: "Max 5 files" }, { status: 400 });

  const uploadsDir = path.join(process.cwd(), "public", "uploads", modelId);
  await fs.mkdir(uploadsDir, { recursive: true });

  const urls: string[] = [];
  const stamp = Date.now();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = path.extname(file.name || "").slice(0, 10).toLowerCase() || ".jpg";
    const fileName = `img-${stamp}-${i + 1}${ext}`;
    const filePath = path.join(uploadsDir, fileName);
    const buf = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buf);
    urls.push(`/uploads/${modelId}/${fileName}`);
  }

  return NextResponse.json({ urls });
}


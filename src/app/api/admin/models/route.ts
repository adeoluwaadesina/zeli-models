import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/adminAuth";
import { readModels, writeModels } from "@/lib/modelsStore";
import type { ZeliModel } from "@/data/models";

export const runtime = "nodejs";

function isAuthed(req: NextRequest) {
  return req.cookies.get(ADMIN_COOKIE)?.value === "1";
}

function isZeliModel(x: unknown): x is ZeliModel {
  if (!x || typeof x !== "object") return false;
  const m = x as Record<string, unknown>;
  return (
    typeof m.id === "string" &&
    typeof m.name === "string" &&
    typeof m.height === "string" &&
    typeof m.bio === "string" &&
    Array.isArray(m.images) &&
    m.images.every((v) => typeof v === "string")
  );
}

export async function GET(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const models = await readModels();
  return NextResponse.json({ models });
}

export async function PUT(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as unknown;
  const models = (body as { models?: unknown })?.models;
  if (!Array.isArray(models) || !models.every(isZeliModel)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  await writeModels(models);
  return NextResponse.json({ ok: true });
}


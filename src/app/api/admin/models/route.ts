import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/adminAuth";
import { normalizeModel, type ModelGender, type ZeliModel } from "@/data/models";
import { readModels, writeModels } from "@/lib/modelsStore";

export const runtime = "nodejs";

async function isAuthed(req: NextRequest) {
  return verifyAdminSession(req.cookies.get(ADMIN_COOKIE)?.value);
}

function isZeliModelBase(x: unknown): boolean {
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

function parseModelPayload(x: unknown): ZeliModel | null {
  if (!isZeliModelBase(x)) return null;
  const m = x as Record<string, unknown>;
  const gender: ModelGender = m.gender === "male" ? "male" : "female";
  const tags = Array.isArray(m.tags)
    ? m.tags.filter((t): t is string => typeof t === "string")
    : typeof m.tags === "string"
      ? m.tags
          .split(/[,|·]/)
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
  return normalizeModel({
    id: m.id as string,
    name: m.name as string,
    height: m.height as string,
    bio: m.bio as string,
    images: m.images as string[],
    gender,
    featured: Boolean(m.featured),
    featuredOrder:
      typeof m.featuredOrder === "number" && !Number.isNaN(m.featuredOrder)
        ? m.featuredOrder
        : null,
    tags,
    chest: typeof m.chest === "string" ? m.chest : "",
    waist: typeof m.waist === "string" ? m.waist : "",
    hips: typeof m.hips === "string" ? m.hips : "",
    shoe: typeof m.shoe === "string" ? m.shoe : "",
    eyes: typeof m.eyes === "string" ? m.eyes : "",
    hair: typeof m.hair === "string" ? m.hair : "",
    heightCm: typeof m.heightCm === "string" ? m.heightCm : "",
    featuredImageUrl:
      typeof m.featuredImageUrl === "string" ? m.featuredImageUrl : ""
  });
}

function validateFeatured(models: ZeliModel[]): string | null {
  const featured = models.filter((m) => m.featured);
  if (featured.length > 4) return "At most 4 models can be featured on the home page.";
  const orders = featured.map((m) => m.featuredOrder ?? 0);
  for (const m of featured) {
    const o = m.featuredOrder;
    if (o == null || o < 0 || o > 3) {
      return "Featured models must have Featured order set between 0 and 3.";
    }
  }
  const unique = new Set(orders);
  if (unique.size !== orders.length) return "Featured order values must be unique (0–3).";
  return null;
}

export async function GET(req: NextRequest) {
  if (!(await isAuthed(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const models = await readModels();
  return NextResponse.json({ models });
}

export async function PUT(req: NextRequest) {
  if (!(await isAuthed(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as unknown;
  const raw = (body as { models?: unknown })?.models;
  if (!Array.isArray(raw)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const models: ZeliModel[] = [];
  for (const item of raw) {
    const parsed = parseModelPayload(item);
    if (!parsed) return NextResponse.json({ error: "Invalid model in payload" }, { status: 400 });
    models.push(parsed);
  }
  const featErr = validateFeatured(models);
  if (featErr) return NextResponse.json({ error: featErr }, { status: 400 });
  await writeModels(models);
  return NextResponse.json({ ok: true });
}

import { promises as fs } from "node:fs";
import path from "node:path";
import type { ModelGender, ZeliModel } from "@/data/models";
import { normalizeModel } from "@/data/models";
import { getSupabaseAdmin, getSupabasePublic } from "@/lib/supabase";

const DATA_DIR = path.join(process.cwd(), "data");
const MODELS_PATH = path.join(DATA_DIR, "models.json");

type ModelsFile = { models: ZeliModel[] };

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

function fromRow(r: Record<string, unknown>): ZeliModel {
  const tagsRaw = r.tags;
  const tags = Array.isArray(tagsRaw)
    ? tagsRaw.filter((t): t is string => typeof t === "string")
    : typeof tagsRaw === "string" && tagsRaw.trim()
      ? tagsRaw.split(/[,|·]/).map((s) => s.trim()).filter(Boolean)
      : [];

  return normalizeModel({
    id: String(r.id),
    name: String(r.name),
    height: String(r.height),
    bio: String(r.bio),
    images: Array.isArray(r.images) ? (r.images as string[]) : [],
    gender: r.gender === "male" ? "male" : "female",
    featured: Boolean(r.featured),
    featuredOrder:
      typeof r.featured_order === "number" && !Number.isNaN(r.featured_order)
        ? r.featured_order
        : null,
    tags,
    chest: typeof r.chest === "string" ? r.chest : "",
    waist: typeof r.waist === "string" ? r.waist : "",
    shoe: typeof r.shoe === "string" ? r.shoe : "",
    eyes: typeof r.eyes === "string" ? r.eyes : "",
    hair: typeof r.hair === "string" ? r.hair : "",
    heightCm: typeof r.height_cm === "string" ? r.height_cm : "",
    featuredImageUrl:
      typeof r.featured_image_url === "string" ? r.featured_image_url : ""
  });
}

function toRow(m: ZeliModel, position: number) {
  return {
    id: m.id,
    name: m.name,
    height: m.height,
    bio: m.bio,
    images: m.images,
    position,
    gender: m.gender,
    featured: m.featured,
    featured_order: m.featured ? m.featuredOrder : null,
    tags: m.tags,
    chest: m.chest,
    waist: m.waist,
    shoe: m.shoe,
    eyes: m.eyes,
    hair: m.hair,
    height_cm: m.heightCm,
    featured_image_url: m.featuredImageUrl,
    updated_at: new Date().toISOString()
  };
}

export async function readModels(): Promise<ZeliModel[]> {
  const supabase = getSupabasePublic();
  if (supabase) {
    const { data, error } = await supabase
      .from("models")
      .select(
        "id,name,height,bio,images,position,gender,featured,featured_order,tags,chest,waist,shoe,eyes,hair,height_cm,featured_image_url"
      )
      .order("position", { ascending: true });

    if (error) throw error;
    return (data ?? []).map((r) => fromRow(r as Record<string, unknown>));
  }

  const raw = await fs.readFile(MODELS_PATH, "utf-8");
  const parsed = JSON.parse(raw) as unknown;
  const models = (parsed as ModelsFile | null)?.models;
  if (!Array.isArray(models) || !models.every(isZeliModel)) {
    throw new Error("Invalid models.json format");
  }
  return models.map((m) =>
    normalizeModel({
      ...m,
      gender: (m as ZeliModel).gender === "male" ? "male" : "female",
      featured: Boolean((m as ZeliModel).featured),
      featuredOrder:
        typeof (m as ZeliModel).featuredOrder === "number"
          ? (m as ZeliModel).featuredOrder
          : null,
      tags: Array.isArray((m as ZeliModel).tags) ? (m as ZeliModel).tags : [],
      chest: (m as ZeliModel).chest ?? "",
      waist: (m as ZeliModel).waist ?? "",
      shoe: (m as ZeliModel).shoe ?? "",
      eyes: (m as ZeliModel).eyes ?? "",
      hair: (m as ZeliModel).hair ?? "",
      heightCm: (m as ZeliModel).heightCm ?? "",
      featuredImageUrl: (m as ZeliModel).featuredImageUrl ?? ""
    })
  );
}

export async function writeModels(models: ZeliModel[]): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin();
  if (supabaseAdmin) {
    const rows = models.map((m, idx) => toRow(m, idx));

    const { data: existing, error: existingErr } = await supabaseAdmin
      .from("models")
      .select("id");
    if (existingErr) throw existingErr;
    const existingIds = new Set((existing ?? []).map((r: { id: string }) => r.id));
    const incomingIds = new Set(models.map((m) => m.id));
    const removed = [...existingIds].filter((id) => !incomingIds.has(id));

    if (removed.length > 0) {
      const { error: delErr } = await supabaseAdmin.from("models").delete().in("id", removed);
      if (delErr) throw delErr;
    }

    const { error: upErr } = await supabaseAdmin.from("models").upsert(rows, { onConflict: "id" });
    if (upErr) throw upErr;
    return;
  }

  await fs.mkdir(DATA_DIR, { recursive: true });
  const out: ModelsFile = { models };
  await fs.writeFile(MODELS_PATH, JSON.stringify(out, null, 2) + "\n", "utf-8");
}

export async function readModelById(id: string): Promise<ZeliModel | null> {
  const all = await readModels();
  return all.find((m) => m.id === id) ?? null;
}

export async function readModelsByGender(gender: ModelGender): Promise<ZeliModel[]> {
  const all = await readModels();
  return all.filter((m) => m.gender === gender);
}

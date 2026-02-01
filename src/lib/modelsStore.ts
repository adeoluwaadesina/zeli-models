import { promises as fs } from "node:fs";
import path from "node:path";
import type { ZeliModel } from "@/data/models";
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

export async function readModels(): Promise<ZeliModel[]> {
  const supabase = getSupabasePublic();
  if (supabase) {
    const { data, error } = await supabase
      .from("models")
      .select("id,name,height,bio,images,position")
      .order("position", { ascending: true });

    if (error) throw error;
    return (data ?? []).map((r) => ({
      id: String(r.id),
      name: String(r.name),
      height: String(r.height),
      bio: String(r.bio),
      images: Array.isArray(r.images) ? (r.images as string[]) : []
    }));
  }

  const raw = await fs.readFile(MODELS_PATH, "utf-8");
  const parsed = JSON.parse(raw) as unknown;
  const models = (parsed as ModelsFile | null)?.models;
  if (!Array.isArray(models) || !models.every(isZeliModel)) {
    throw new Error("Invalid models.json format");
  }
  return models;
}

export async function writeModels(models: ZeliModel[]): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin();
  if (supabaseAdmin) {
    // Upsert all rows with a position matching the current array order.
    const rows = models.map((m, idx) => ({
      id: m.id,
      name: m.name,
      height: m.height,
      bio: m.bio,
      images: m.images,
      position: idx,
      updated_at: new Date().toISOString()
    }));

    // Remove models not present anymore.
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


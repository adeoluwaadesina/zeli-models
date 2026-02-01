import { promises as fs } from "node:fs";
import path from "node:path";
import type { ZeliModel } from "@/data/models";

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
  const raw = await fs.readFile(MODELS_PATH, "utf-8");
  const parsed = JSON.parse(raw) as unknown;
  const models = (parsed as ModelsFile | null)?.models;
  if (!Array.isArray(models) || !models.every(isZeliModel)) {
    throw new Error("Invalid models.json format");
  }
  return models;
}

export async function writeModels(models: ZeliModel[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const out: ModelsFile = { models };
  await fs.writeFile(MODELS_PATH, JSON.stringify(out, null, 2) + "\n", "utf-8");
}


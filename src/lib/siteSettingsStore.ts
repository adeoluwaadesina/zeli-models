import { promises as fs } from "node:fs";
import path from "node:path";
import {
  DEFAULT_SITE_SETTINGS,
  type OurValueItem,
  type SiteSettings,
  type WhatWeDoItem
} from "@/data/siteSettings";
import { getSupabaseAdmin, getSupabasePublic } from "@/lib/supabase";

const DATA_DIR = path.join(process.cwd(), "data");
const SITE_PATH = path.join(DATA_DIR, "site-settings.json");

type WhatWeDoRow = {
  id?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  sortOrder?: number;
};

type OurValueRow = {
  id?: string;
  title?: string;
  text?: string;
};

function normalizeWhatWeDo(raw: unknown): WhatWeDoItem[] {
  if (!Array.isArray(raw)) return [...DEFAULT_SITE_SETTINGS.whatWeDo];
  return raw.map((x, i) => {
    const r = x as WhatWeDoRow;
    return {
      id: typeof r.id === "string" ? r.id : `wd-${i}`,
      title: typeof r.title === "string" ? r.title : "",
      description: typeof r.description === "string" ? r.description : "",
      imageUrl: typeof r.imageUrl === "string" ? r.imageUrl : "",
      sortOrder: typeof r.sortOrder === "number" ? r.sortOrder : i
    };
  });
}

function normalizeOurValues(raw: unknown): OurValueItem[] {
  if (!Array.isArray(raw)) return [...DEFAULT_SITE_SETTINGS.ourValues];
  return raw.map((x, i) => {
    const r = x as OurValueRow;
    return {
      id: typeof r.id === "string" ? r.id : `v-${i}`,
      title: typeof r.title === "string" ? r.title : "",
      text: typeof r.text === "string" ? r.text : ""
    };
  });
}

export function mergeSiteSettings(partial: Partial<SiteSettings>): SiteSettings {
  const base = DEFAULT_SITE_SETTINGS;
  return {
    marqueeCategories:
      Array.isArray(partial.marqueeCategories) && partial.marqueeCategories.length
        ? partial.marqueeCategories
        : base.marqueeCategories,
    whatWeDo:
      Array.isArray(partial.whatWeDo) && partial.whatWeDo.length
        ? normalizeWhatWeDo(partial.whatWeDo)
        : base.whatWeDo,
    ourValues:
      Array.isArray(partial.ourValues) && partial.ourValues.length
        ? normalizeOurValues(partial.ourValues)
        : base.ourValues,
    instagramUrl: typeof partial.instagramUrl === "string" ? partial.instagramUrl : base.instagramUrl
  };
}

function rowToSettings(r: {
  marquee_categories: string[] | null;
  what_we_do: unknown;
  our_values: unknown;
  instagram_url: string | null;
}): SiteSettings {
  return mergeSiteSettings({
    marqueeCategories: Array.isArray(r.marquee_categories) ? r.marquee_categories : undefined,
    whatWeDo: normalizeWhatWeDo(r.what_we_do),
    ourValues: normalizeOurValues(r.our_values),
    instagramUrl: r.instagram_url ?? ""
  });
}

export async function readSiteSettings(): Promise<SiteSettings> {
  const supabase = getSupabasePublic();
  if (supabase) {
    const { data, error } = await supabase
      .from("site_settings")
      .select("marquee_categories,what_we_do,our_values,instagram_url")
      .eq("id", 1)
      .maybeSingle();

    if (error) throw error;
    if (data) return rowToSettings(data);
  }

  try {
    const raw = await fs.readFile(SITE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    const o = parsed as Record<string, unknown>;
    return mergeSiteSettings({
      marqueeCategories: o.marqueeCategories as string[] | undefined,
      whatWeDo: o.whatWeDo as WhatWeDoItem[] | undefined,
      ourValues: o.ourValues as OurValueItem[] | undefined,
      instagramUrl: o.instagramUrl as string | undefined
    });
  } catch {
    return { ...DEFAULT_SITE_SETTINGS };
  }
}

export async function writeSiteSettings(settings: SiteSettings): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin();
  if (supabaseAdmin) {
    const { error } = await supabaseAdmin.from("site_settings").upsert(
      {
        id: 1,
        marquee_categories: settings.marqueeCategories,
        what_we_do: settings.whatWeDo,
        our_values: settings.ourValues,
        instagram_url: settings.instagramUrl,
        updated_at: new Date().toISOString()
      },
      { onConflict: "id" }
    );
    if (error) throw error;
    return;
  }

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(SITE_PATH, JSON.stringify(settings, null, 2) + "\n", "utf-8");
}

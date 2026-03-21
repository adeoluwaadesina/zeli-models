import type { SiteSettings } from "@/data/siteSettings";

/** Prefer admin-configured URL, then env; return empty if neither set. */
export function resolveInstagramUrl(settings: Pick<SiteSettings, "instagramUrl">): string {
  const fromSettings = settings.instagramUrl?.trim();
  if (fromSettings) return fromSettings;
  const env = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() : "";
  return env || "";
}

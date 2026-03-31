import type { SiteSettings } from "@/data/siteSettings";

/** Default public TikTok when admin and env leave URL empty */
export const DEFAULT_TIKTOK_URL =
  "https://www.tiktok.com/@zelimodels?_r=1&_t=ZS-956ULYTR54E";

export function resolveTiktokUrl(settings: Pick<SiteSettings, "tiktokUrl">): string {
  const fromSettings = settings.tiktokUrl?.trim();
  if (fromSettings) return fromSettings;
  const env =
    typeof process !== "undefined" ? process.env.NEXT_PUBLIC_TIKTOK_URL?.trim() : "";
  if (env) return env;
  return DEFAULT_TIKTOK_URL;
}

/** Non-empty when X/Twitter should be a real link; empty keeps placeholder control */
export function resolveTwitterHref(settings: Pick<SiteSettings, "twitterUrl">): string {
  return (settings.twitterUrl ?? "").trim();
}

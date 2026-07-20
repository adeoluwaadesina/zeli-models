import { getSupabaseAdmin } from "@/lib/supabase";

export type AnalyticsRange = 7 | 30 | 90;

/** All day/hour grouping uses West Africa Time so the charts match Zeli's clock. */
const TIME_ZONE = "Africa/Lagos";

export interface DayPoint {
  day: string; // YYYY-MM-DD in WAT
  views: number;
  uniques: number;
}

export interface CountRow {
  key: string;
  count: number;
}

export interface AnalyticsSummary {
  totalViews: number;
  uniqueVisitors: number;
  byDay: DayPoint[];
  byHour: number[]; // 24 buckets, WAT
  topPages: CountRow[];
  topModels: CountRow[]; // key = model_id
  topCities: CountRow[];
  topCountries: CountRow[];
  devices: CountRow[];
  referrers: CountRow[];
  inquiriesByDay: DayPoint[]; // views = contact submissions, uniques = model applications
  totalContacts: number;
  totalApplications: number;
  truncated: boolean;
}

interface ViewRow {
  created_at: string;
  path: string;
  page_type: string;
  model_id: string | null;
  country: string | null;
  city: string | null;
  device: string | null;
  referrer: string | null;
  visitor_hash: string | null;
}

const PAGE_SIZE = 1000;
const MAX_ROWS = 40000;

const dayFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
});
const hourFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  hour12: false
});

function watDay(iso: string): string {
  return dayFmt.format(new Date(iso));
}

function watHour(iso: string): number {
  return Number.parseInt(hourFmt.format(new Date(iso)), 10) % 24;
}

/** Every WAT day in the range, oldest first, so charts show zero days too. */
function dayScaffold(days: number): string[] {
  const out: string[] = [];
  const now = Date.now();
  for (let i = days - 1; i >= 0; i--) {
    out.push(dayFmt.format(new Date(now - i * 24 * 60 * 60 * 1000)));
  }
  return out;
}

function topOf(map: Map<string, number>, limit: number): CountRow[] {
  return [...map.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function bump(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

const PAGE_LABELS: Record<string, string> = {
  home: "Home",
  women: "Women board",
  men: "Men board",
  booking: "Book a model",
  apply: "Become a model",
  model: "Model portfolios"
};

export async function readAnalytics(days: AnalyticsRange): Promise<AnalyticsSummary | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const rows: ViewRow[] = [];
  let truncated = false;
  for (let from = 0; from < MAX_ROWS; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("page_views")
      .select("created_at,path,page_type,model_id,country,city,device,referrer,visitor_hash")
      .gte("created_at", cutoff)
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);
    if (error) {
      // Table missing (migration not run yet) or transient failure: surface as "not set up".
      console.error("[analytics] page_views:", error.message);
      return null;
    }
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) break;
    if (from + PAGE_SIZE >= MAX_ROWS) truncated = true;
  }

  const uniqueHashes = new Set<string>();
  const perDay = new Map<string, { views: number; hashes: Set<string> }>();
  const byHour = Array.from({ length: 24 }, () => 0);
  const pages = new Map<string, number>();
  const models = new Map<string, number>();
  const cities = new Map<string, number>();
  const countries = new Map<string, number>();
  const devices = new Map<string, number>();
  const referrers = new Map<string, number>();

  for (const r of rows) {
    const day = watDay(r.created_at);
    const bucket = perDay.get(day) ?? { views: 0, hashes: new Set<string>() };
    bucket.views += 1;
    if (r.visitor_hash) {
      bucket.hashes.add(r.visitor_hash);
      uniqueHashes.add(r.visitor_hash);
    }
    perDay.set(day, bucket);

    byHour[watHour(r.created_at)] += 1;

    bump(pages, PAGE_LABELS[r.page_type] ?? r.path);
    if (r.model_id) bump(models, r.model_id);
    if (r.city) bump(cities, r.country ? `${r.city}, ${r.country}` : r.city);
    bump(countries, r.country ?? "Unknown");
    bump(devices, r.device ?? "unknown");
    bump(referrers, r.referrer ?? "Direct / none");
  }

  const scaffold = dayScaffold(days);
  const byDay: DayPoint[] = scaffold.map((day) => {
    const bucket = perDay.get(day);
    return { day, views: bucket?.views ?? 0, uniques: bucket?.hashes.size ?? 0 };
  });

  // Inquiries over the same range, from the existing inbox tables.
  const [contactsRes, appsRes] = await Promise.all([
    supabase.from("contact_submissions").select("created_at").gte("created_at", cutoff).limit(5000),
    supabase.from("model_applications").select("created_at").gte("created_at", cutoff).limit(5000)
  ]);
  const contactDays = new Map<string, number>();
  const appDays = new Map<string, number>();
  for (const c of contactsRes.data ?? []) bump(contactDays, watDay(c.created_at));
  for (const a of appsRes.data ?? []) bump(appDays, watDay(a.created_at));
  const inquiriesByDay: DayPoint[] = scaffold.map((day) => ({
    day,
    views: contactDays.get(day) ?? 0,
    uniques: appDays.get(day) ?? 0
  }));

  return {
    totalViews: rows.length,
    uniqueVisitors: uniqueHashes.size,
    byDay,
    byHour,
    topPages: topOf(pages, 8),
    topModels: topOf(models, 8),
    topCities: topOf(cities, 8),
    topCountries: topOf(countries, 8),
    devices: topOf(devices, 4),
    referrers: topOf(referrers, 8),
    inquiriesByDay,
    totalContacts: (contactsRes.data ?? []).length,
    totalApplications: (appsRes.data ?? []).length,
    truncated
  };
}

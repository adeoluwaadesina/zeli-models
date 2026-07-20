import Link from "next/link";
import { readAnalytics, type AnalyticsRange } from "@/lib/analyticsStore";
import { portfolioDisplayName } from "@/lib/displayName";
import { readModels } from "@/lib/modelsStore";
import { requireAdmin } from "@/lib/requireAdmin";
import pageStyles from "../page.module.css";
import { BarList, DailyTrendChart, HourChart, InquiriesChart } from "./charts";
import styles from "./analytics.module.css";

export const dynamic = "force-dynamic";

const RANGES: { value: AnalyticsRange; label: string }[] = [
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" }
];

function parseRange(raw: string | undefined): AnalyticsRange {
  const n = Number.parseInt(raw ?? "", 10);
  return n === 7 || n === 90 ? n : 30;
}

const DEVICE_LABELS: Record<string, string> = {
  mobile: "Phone",
  desktop: "Desktop",
  tablet: "Tablet",
  unknown: "Unknown"
};

export default async function AdminAnalyticsPage({
  searchParams
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  await requireAdmin("/admin/analytics");
  const range = parseRange((await searchParams).range);
  const [summary, models] = await Promise.all([readAnalytics(range), readModels()]);

  const modelName = new Map(models.map((m) => [m.id, portfolioDisplayName(m.name)]));

  return (
    <div className={pageStyles.page}>
      <div className={pageStyles.pageIntro}>
        <div className="container">
          <p className={pageStyles.kicker}>Insights</p>
          <h1 className={pageStyles.title}>Analytics</h1>
          <p className={pageStyles.subtitle}>
            Who is visiting the site, what they look at, and when. Times are West Africa Time.
            Counting starts from the day this feature went live.
          </p>
        </div>
      </div>

      <div className="container">
        {!summary ? (
          <div className={styles.setupNotice}>
            <p className={styles.setupTitle}>Analytics is not receiving data yet.</p>
            <p className={styles.setupBody}>
              The <code>page_views</code> table has not been created in Supabase (or Supabase is
              not configured). Run the migration <code>supabase/migrations/010_page_views.sql</code>{" "}
              in the Supabase SQL editor, then refresh this page.
            </p>
          </div>
        ) : (
          <>
            <div className={styles.rangeRow} role="group" aria-label="Date range">
              {RANGES.map((r) => (
                <Link
                  key={r.value}
                  href={`/admin/analytics?range=${r.value}`}
                  className={`${styles.rangeTab} ${range === r.value ? styles.rangeTabActive : ""}`}
                  aria-current={range === r.value ? "page" : undefined}
                >
                  {r.label}
                </Link>
              ))}
            </div>

            <div className={pageStyles.statsBand}>
              <div className={pageStyles.statCard}>
                <span className={pageStyles.statValue}>{summary.totalViews.toLocaleString()}</span>
                <span className={pageStyles.statLabel}>Page views</span>
              </div>
              <div className={pageStyles.statCard}>
                <span className={`${pageStyles.statValue} ${pageStyles.statValueAccent}`}>
                  {summary.uniqueVisitors.toLocaleString()}
                </span>
                <span className={pageStyles.statLabel}>Visitors (per day)</span>
              </div>
              <div className={pageStyles.statCard}>
                <span className={pageStyles.statValue}>
                  {summary.totalContacts.toLocaleString()}
                </span>
                <span className={pageStyles.statLabel}>Inquiries</span>
              </div>
              <div className={pageStyles.statCard}>
                <span className={pageStyles.statValue}>
                  {summary.totalApplications.toLocaleString()}
                </span>
                <span className={pageStyles.statLabel}>Applications</span>
              </div>
            </div>

            {summary.totalViews === 0 ? (
              <div className={styles.setupNotice}>
                <p className={styles.setupTitle}>No visits recorded in this period yet.</p>
                <p className={styles.setupBody}>
                  Tracking only counts visits that happen after this feature is live. Check back
                  after the site has had some traffic.
                </p>
              </div>
            ) : (
              <>
                <section className={styles.panel}>
                  <h2 className={styles.panelTitle}>Daily visits</h2>
                  <p className={styles.panelHint}>
                    Bars show page views per day; the darker portion is unique visitors.
                  </p>
                  <DailyTrendChart data={summary.byDay} />
                </section>

                <div className={styles.panelGrid}>
                  <section className={styles.panel}>
                    <h2 className={styles.panelTitle}>Time of day</h2>
                    <p className={styles.panelHint}>Views by hour, West Africa Time.</p>
                    <HourChart data={summary.byHour} />
                  </section>

                  <section className={styles.panel}>
                    <h2 className={styles.panelTitle}>Devices</h2>
                    <BarList
                      rows={summary.devices.map((d) => ({
                        label: DEVICE_LABELS[d.key] ?? d.key,
                        count: d.count
                      }))}
                      total={summary.totalViews}
                    />
                    <h2 className={`${styles.panelTitle} ${styles.panelTitleStacked}`}>
                      Traffic sources
                    </h2>
                    <BarList
                      rows={summary.referrers.map((r) => ({ label: r.key, count: r.count }))}
                      total={summary.totalViews}
                    />
                  </section>

                  <section className={styles.panel}>
                    <h2 className={styles.panelTitle}>Most viewed pages</h2>
                    <BarList
                      rows={summary.topPages.map((p) => ({ label: p.key, count: p.count }))}
                      total={summary.totalViews}
                    />
                  </section>

                  <section className={styles.panel}>
                    <h2 className={styles.panelTitle}>Most viewed models</h2>
                    {summary.topModels.length === 0 ? (
                      <p className={styles.emptyHint}>No model portfolio views yet.</p>
                    ) : (
                      <BarList
                        rows={summary.topModels.map((m) => ({
                          label: modelName.get(m.key) ?? m.key,
                          count: m.count
                        }))}
                        total={summary.topModels[0].count}
                        proportional
                      />
                    )}
                  </section>

                  <section className={styles.panel}>
                    <h2 className={styles.panelTitle}>Top cities</h2>
                    {summary.topCities.length === 0 ? (
                      <p className={styles.emptyHint}>No location data yet.</p>
                    ) : (
                      <BarList
                        rows={summary.topCities.map((c) => ({ label: c.key, count: c.count }))}
                        total={summary.topCities[0].count}
                        proportional
                      />
                    )}
                    <h2 className={`${styles.panelTitle} ${styles.panelTitleStacked}`}>Countries</h2>
                    <BarList
                      rows={summary.topCountries.map((c) => ({ label: c.key, count: c.count }))}
                      total={summary.totalViews}
                    />
                  </section>

                  <section className={styles.panel}>
                    <h2 className={styles.panelTitle}>Inquiries and applications</h2>
                    <p className={styles.panelHint}>
                      Contact and booking messages, plus new model applications, per day.
                    </p>
                    <InquiriesChart data={summary.inquiriesByDay} />
                  </section>
                </div>

                {summary.truncated ? (
                  <p className={styles.truncatedNote}>
                    Showing the most recent 40,000 views in this period; older rows in the range
                    are not included in the charts.
                  </p>
                ) : null}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

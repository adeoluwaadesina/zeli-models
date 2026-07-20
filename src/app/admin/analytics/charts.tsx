import type { DayPoint } from "@/lib/analyticsStore";
import styles from "./analytics.module.css";

/** Server-rendered SVG charts. No client JS, no chart library. */

const INK = "#4a2c1d";
const ACCENT = "#a67c5b";

function shortDay(day: string): string {
  const d = new Date(`${day}T12:00:00Z`);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

export function DailyTrendChart({ data }: { data: DayPoint[] }) {
  const w = 720;
  const h = 180;
  const pad = 4;
  const max = Math.max(1, ...data.map((d) => d.views));
  const step = (w - pad * 2) / data.length;
  const barW = Math.max(2, Math.min(26, step * 0.62));
  const labelEvery = Math.max(1, Math.ceil(data.length / 10));

  return (
    <div className={styles.chartScroll}>
      <svg
        viewBox={`0 0 ${w} ${h + 22}`}
        className={styles.chart}
        role="img"
        aria-label="Daily page views and unique visitors"
      >
        {data.map((d, i) => {
          const x = pad + i * step + (step - barW) / 2;
          const vh = (d.views / max) * (h - 8);
          const uh = (d.uniques / max) * (h - 8);
          return (
            <g key={d.day}>
              <title>{`${shortDay(d.day)}: ${d.views} views, ${d.uniques} visitors`}</title>
              <rect x={x} y={h - vh} width={barW} height={vh} rx={2} fill={ACCENT} opacity={0.42} />
              <rect x={x} y={h - uh} width={barW} height={uh} rx={2} fill={INK} opacity={0.82} />
              {i % labelEvery === 0 ? (
                <text x={x + barW / 2} y={h + 16} textAnchor="middle" className={styles.axisLabel}>
                  {shortDay(d.day)}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function HourChart({ data }: { data: number[] }) {
  const w = 480;
  const h = 140;
  const pad = 2;
  const max = Math.max(1, ...data);
  const step = (w - pad * 2) / 24;
  const barW = step * 0.6;

  return (
    <svg
      viewBox={`0 0 ${w} ${h + 22}`}
      className={styles.chart}
      role="img"
      aria-label="Page views by hour of day"
    >
      {data.map((count, hour) => {
        const x = pad + hour * step + (step - barW) / 2;
        const bh = (count / max) * (h - 8);
        return (
          <g key={hour}>
            <title>{`${hour}:00 to ${hour}:59 — ${count} views`}</title>
            <rect x={x} y={h - bh} width={barW} height={Math.max(bh, count > 0 ? 2 : 0)} rx={1.5} fill={INK} opacity={0.78} />
            {hour % 4 === 0 ? (
              <text x={x + barW / 2} y={h + 16} textAnchor="middle" className={styles.axisLabel}>
                {`${hour}h`}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

export function InquiriesChart({ data }: { data: DayPoint[] }) {
  const w = 480;
  const h = 140;
  const pad = 4;
  const max = Math.max(1, ...data.map((d) => d.views + d.uniques));
  const step = (w - pad * 2) / data.length;
  const barW = Math.max(2, Math.min(22, step * 0.62));
  const labelEvery = Math.max(1, Math.ceil(data.length / 8));

  return (
    <div className={styles.chartScroll}>
      <svg
        viewBox={`0 0 ${w} ${h + 22}`}
        className={styles.chart}
        role="img"
        aria-label="Inquiries and applications per day"
      >
        {data.map((d, i) => {
          const x = pad + i * step + (step - barW) / 2;
          const ch = (d.views / max) * (h - 8);
          const ah = (d.uniques / max) * (h - 8);
          return (
            <g key={d.day}>
              <title>{`${shortDay(d.day)}: ${d.views} inquiries, ${d.uniques} applications`}</title>
              <rect x={x} y={h - ch} width={barW} height={ch} rx={1.5} fill={INK} opacity={0.78} />
              <rect x={x} y={h - ch - ah} width={barW} height={ah} rx={1.5} fill={ACCENT} opacity={0.6} />
              {i % labelEvery === 0 ? (
                <text x={x + barW / 2} y={h + 16} textAnchor="middle" className={styles.axisLabel}>
                  {shortDay(d.day)}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      <p className={styles.legendRow}>
        <span className={styles.legendSwatchInk} /> Inquiries
        <span className={styles.legendSwatchAccent} /> Applications
      </p>
    </div>
  );
}

export function BarList({
  rows,
  total,
  proportional = false
}: {
  rows: { label: string; count: number }[];
  total: number;
  /** When true, bars scale to the largest row instead of the grand total. */
  proportional?: boolean;
}) {
  if (rows.length === 0) {
    return <p className={styles.emptyHint}>Nothing recorded yet.</p>;
  }
  const denom = Math.max(1, proportional ? rows[0].count : total);
  return (
    <ul className={styles.barList}>
      {rows.map((r) => (
        <li key={r.label} className={styles.barRow}>
          <span className={styles.barLabel}>{r.label}</span>
          <span className={styles.barTrack} aria-hidden="true">
            <span
              className={styles.barFill}
              style={{ width: `${Math.max(2, Math.round((r.count / denom) * 100))}%` }}
            />
          </span>
          <span className={styles.barCount}>{r.count.toLocaleString()}</span>
        </li>
      ))}
    </ul>
  );
}

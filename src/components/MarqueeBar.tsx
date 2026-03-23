import styles from "./MarqueeBar.module.css";

/** Visible gap between category words (nbsp so it doesn’t collapse). */
const MARQUEE_GAP = "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0";

export function MarqueeBar({ categories }: { categories: string[] }) {
  if (!categories.length) return null;
  const parts = categories.map((c) => c.toUpperCase());
  const segment = parts.join(MARQUEE_GAP);
  const doubled = `${segment}${MARQUEE_GAP}${segment}${MARQUEE_GAP}`;

  return (
    <div className={styles.wrap} aria-hidden="true">
      <div className={styles.bar}>
        <div className={styles.track}>
          <span className={styles.text}>{doubled}</span>
          <span className={styles.text}>{doubled}</span>
        </div>
      </div>
    </div>
  );
}

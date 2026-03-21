import styles from "./MarqueeBar.module.css";

export function MarqueeBar({ categories }: { categories: string[] }) {
  if (!categories.length) return null;
  const parts = categories.map((c) => c.toUpperCase());
  const segment = parts.join("   ||   ");
  const doubled = `${segment}   ||   ${segment}   ||   `;

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

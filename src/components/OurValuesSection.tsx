import type { OurValueItem } from "@/data/siteSettings";
import styles from "./OurValuesSection.module.css";

export function OurValuesSection({ values }: { values: OurValueItem[] }) {
  if (!values.length) return null;

  return (
    <section className={styles.section} id="values" aria-labelledby="values-heading">
      <div className="container">
        <div className={styles.headerRow} data-reveal>
          <p className={styles.kicker}>Our values</p>
          <h2 id="values-heading" className={styles.title}>
            How we <span className={styles.titleItalic}>work</span>
          </h2>
        </div>
        <div className={styles.grid}>
          {values.map((v, idx) => (
            <article
              key={v.id}
              className={styles.card}
              data-reveal
              style={{ ["--reveal-delay" as string]: `${idx * 0.08}s` }}
            >
              <span className={styles.cardIndex} aria-hidden="true">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <h3 className={styles.cardTitle}>{v.title}</h3>
              <p className={styles.cardText}>{v.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

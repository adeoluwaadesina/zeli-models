import type { OurValueItem } from "@/data/siteSettings";
import styles from "./OurValuesSection.module.css";

export function OurValuesSection({ values }: { values: OurValueItem[] }) {
  if (!values.length) return null;

  return (
    <section className={styles.section} id="values" aria-labelledby="values-heading">
      <div className="container">
        <p className={styles.kicker}>Our values</p>
        <h2 id="values-heading" className={styles.title}>
          How we work
        </h2>
        <div className={styles.grid}>
          {values.map((v) => (
            <article key={v.id} className={styles.card}>
              <h3 className={styles.cardTitle}>{v.title}</h3>
              <p className={styles.cardText}>{v.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

import * as React from "react";
import { MODELS } from "@/data/models";
import { ModelCard } from "./ModelCard";
import styles from "./ModelGrid.module.css";

export function ModelGrid() {
  return (
    <section className={styles.section} id="portfolio">
      <div className="container">
        <div className={styles.headerRow}>
          <h2 className={`${styles.title} ${styles.titleCenter}`}>
            Our Portfolio
          </h2>
          <div className={styles.hairlineWrap}>
            <div className="hairline" />
          </div>
        </div>

        <div className={styles.grid}>
          {MODELS.map((m) => (
            <ModelCard key={m.id} model={m} />
          ))}
        </div>
      </div>
    </section>
  );
}


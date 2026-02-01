import * as React from "react";
import { readModels } from "@/lib/modelsStore";
import { ModelCard } from "./ModelCard";
import styles from "./ModelGrid.module.css";

export async function ModelGrid() {
  const models = await readModels();
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
          {models.map((m) => (
            <ModelCard key={m.id} model={m} />
          ))}
        </div>
      </div>
    </section>
  );
}


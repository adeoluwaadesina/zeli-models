"use client";

import type { WhatWeDoItem } from "@/data/siteSettings";
import * as React from "react";
import styles from "./WhatWeDoCarousel.module.css";

export function WhatWeDoCarousel({ items }: { items: WhatWeDoItem[] }) {
  const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder);
  const [i, setI] = React.useState(0);
  if (!sorted.length) return null;

  const n = sorted.length;
  const cur = sorted[((i % n) + n) % n]!;

  const prev = () => setI((x) => x - 1);
  const next = () => setI((x) => x + 1);

  return (
    <section className={styles.section} id="what-we-do" aria-labelledby="wwd-heading">
      <div className="container">
        <p className={styles.kicker}>What we do</p>
        <h2 id="wwd-heading" className={styles.title}>
          Our services
        </h2>

        <div className={styles.carousel}>
          <button type="button" className={styles.arrow} onClick={prev} aria-label="Previous">
            ‹
          </button>

          <div className={styles.card}>
            <div
              className={styles.bg}
              style={
                cur.imageUrl
                  ? { backgroundImage: `url(${cur.imageUrl})` }
                  : { background: "linear-gradient(135deg, rgba(139,111,85,0.35), rgba(42,26,20,0.15))" }
              }
            />
            <div className={styles.overlay} />
            <div className={styles.content}>
              <h3 className={styles.cardTitle}>{cur.title}</h3>
              <p className={styles.cardDesc}>{cur.description}</p>
            </div>
          </div>

          <button type="button" className={styles.arrow} onClick={next} aria-label="Next">
            ›
          </button>
        </div>

        <div className={styles.dots} role="tablist" aria-label="Service slides">
          {sorted.map((it, idx) => (
            <button
              key={it.id}
              type="button"
              role="tab"
              aria-selected={idx === ((i % n) + n) % n}
              className={idx === ((i % n) + n) % n ? styles.dotActive : styles.dot}
              onClick={() => setI(idx)}
              aria-label={`Show ${it.title}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import type { WhatWeDoItem } from "@/data/siteSettings";
import * as React from "react";
import styles from "./WhatWeDoCarousel.module.css";

const SWIPE_MIN_PX = 48;

export function WhatWeDoCarousel({ items }: { items: WhatWeDoItem[] }) {
  const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder);
  const [i, setI] = React.useState(0);
  const touchStart = React.useRef<{ x: number; y: number } | null>(null);
  if (!sorted.length) return null;

  const n = sorted.length;
  const cur = sorted[((i % n) + n) % n]!;

  const prev = () => setI((x) => x - 1);
  const next = () => setI((x) => x + 1);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    if (!t) return;
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < SWIPE_MIN_PX) return;
    if (Math.abs(dx) < Math.abs(dy) * 1.2) return;
    if (dx > 0) prev();
    else next();
  };

  return (
    <section className={styles.section} id="what-we-do" aria-labelledby="wwd-heading">
      <div className="container">
        <p className={styles.kicker}>What We Do</p>
        <h2 id="wwd-heading" className={styles.title}>
          Our Services
        </h2>

        {n > 1 ? (
          <p className={styles.swipeHint}>Swipe The Card To Browse Services</p>
        ) : null}

        <div className={styles.carousel}>
          <button type="button" className={styles.arrow} onClick={prev} aria-label="Previous">
            ‹
          </button>

          <div
            className={styles.card}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            onTouchCancel={() => {
              touchStart.current = null;
            }}
          >
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

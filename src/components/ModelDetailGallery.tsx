"use client";

import * as React from "react";
import styles from "./ModelDetailGallery.module.css";

export function ModelDetailGallery({ images, alt }: { images: string[]; alt: string }) {
  const [i, setI] = React.useState(0);
  const safe = images.filter(Boolean);
  const n = safe.length;
  const cur = n ? safe[((i % n) + n) % n]! : "";

  if (!cur) {
    return <div className={styles.empty} aria-hidden="true" />;
  }

  const prev = () => setI((x) => x - 1);
  const next = () => setI((x) => x + 1);

  return (
    <div className={styles.wrap}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={cur} alt={alt} className={styles.img} />
      {n > 1 ? (
        <>
          <button type="button" className={`${styles.navBtn} ${styles.prev}`} onClick={prev} aria-label="Previous photo">
            ‹
          </button>
          <button type="button" className={`${styles.navBtn} ${styles.next}`} onClick={next} aria-label="Next photo">
            ›
          </button>
        </>
      ) : null}
    </div>
  );
}

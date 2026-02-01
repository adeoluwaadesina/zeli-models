"use client";

import Image from "next/image";
import * as React from "react";
import styles from "./Carousel.module.css";
import { IconChevronLeft, IconChevronRight } from "./icons";

export function Carousel({
  images,
  alt
}: {
  images: string[];
  alt: string;
}) {
  const [idx, setIdx] = React.useState(0);
  const len = images.length;

  const prev = React.useCallback(() => {
    setIdx((i) => (i - 1 + len) % len);
  }, [len]);

  const next = React.useCallback(() => {
    setIdx((i) => (i + 1) % len);
  }, [len]);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [next, prev]);

  return (
    <div className={styles.frame}>
      <Image
        src={images[idx] ?? images[0]}
        alt={alt}
        fill
        sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 360px"
        className={styles.image}
        priority={idx === 0}
      />

      {len > 1 ? (
        <>
          <button
            type="button"
            className={`${styles.navButton} ${styles.left}`}
            onClick={prev}
            aria-label="Previous image"
          >
            <IconChevronLeft className={styles.icon} />
          </button>
          <button
            type="button"
            className={`${styles.navButton} ${styles.right}`}
            onClick={next}
            aria-label="Next image"
          >
            <IconChevronRight className={styles.icon} />
          </button>

          <div className={styles.dots} aria-hidden="true">
            {images.map((_, i) => (
              <span
                key={i}
                className={`${styles.dot} ${i === idx ? styles.dotActive : ""}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}


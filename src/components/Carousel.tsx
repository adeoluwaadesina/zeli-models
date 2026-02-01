"use client";

import Image from "next/image";
import * as React from "react";
import styles from "./Carousel.module.css";
import { IconChevronLeft, IconChevronRight } from "./icons";

function clamp(min: number, value: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function Carousel({
  images,
  alt
}: {
  images: string[];
  alt: string;
}) {
  const [idx, setIdx] = React.useState(0);
  const len = images.length;
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const [viewportW, setViewportW] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const dragRef = React.useRef<{
    active: boolean;
    pointerId: number | null;
    startX: number;
    startScrollLeft: number;
  }>({ active: false, pointerId: null, startX: 0, startScrollLeft: 0 });

  React.useEffect(() => {
    if (!viewportRef.current) return;
    const el = viewportRef.current;
    const ro = new ResizeObserver(() => {
      setViewportW(el.getBoundingClientRect().width);
    });
    ro.observe(el);
    setViewportW(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  const prev = React.useCallback(() => {
    setIdx((i) => (i - 1 + len) % len);
  }, [len]);

  const next = React.useCallback(() => {
    setIdx((i) => (i + 1) % len);
  }, [len]);

  // Mirrors CSS intent: tile is responsive, capped for the Canva look.
  const gap = 12;
  const tile = clamp(132, viewportW * 0.48, 170);

  const scrollToIndex = React.useCallback(
    (targetIdx: number) => {
      const el = viewportRef.current;
      if (!el) return;
      const step = tile + gap;
      el.scrollTo({ left: targetIdx * step, behavior: "smooth" });
    },
    [gap, tile]
  );

  // Keep idx in sync with free scrolling.
  React.useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const step = tile + gap;
        const padding = (el.clientWidth - tile) / 2;
        const centerX = el.scrollLeft + el.clientWidth / 2;
        const nextIdx = clamp(
          0,
          Math.round((centerX - padding - tile / 2) / step),
          len - 1
        );
        setIdx(nextIdx);
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
    };
  }, [gap, len, tile]);

  // When arrow buttons change idx, scroll to it.
  React.useEffect(() => {
    scrollToIndex(idx);
  }, [idx, scrollToIndex]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    }
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return; // touch/trackpad: native scrolling
    const el = viewportRef.current;
    if (!el) return;
    dragRef.current = {
      active: true,
      pointerId: e.pointerId,
      startX: e.clientX,
      startScrollLeft: el.scrollLeft
    };
    setIsDragging(true);
    el.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = viewportRef.current;
    if (!el) return;
    if (!dragRef.current.active) return;
    if (dragRef.current.pointerId !== e.pointerId) return;
    const dx = e.clientX - dragRef.current.startX;
    el.scrollLeft = dragRef.current.startScrollLeft - dx;
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = viewportRef.current;
    if (!el) return;
    if (!dragRef.current.active) return;
    if (dragRef.current.pointerId !== e.pointerId) return;
    dragRef.current.active = false;
    dragRef.current.pointerId = null;
    setIsDragging(false);

    // Nudge to the nearest snap position (helps mouse drag feel).
    const step = tile + gap;
    const padding = (el.clientWidth - tile) / 2;
    const centerX = el.scrollLeft + el.clientWidth / 2;
    const snapIdx = clamp(
      0,
      Math.round((centerX - padding - tile / 2) / step),
      len - 1
    );
    el.scrollTo({ left: snapIdx * step, behavior: "smooth" });
  };

  return (
    <div
      className={styles.frame}
      style={
        {
          ["--tile" as never]: `${tile}px`,
          ["--gap" as never]: `${gap}px`
        } as React.CSSProperties
      }
    >
      <div
        className={`${styles.viewport} ${isDragging ? styles.dragging : ""}`}
        ref={viewportRef}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        aria-label="Portfolio carousel"
      >
        <div className={styles.track}>
          {images.map((src, i) => (
            <div key={`${src}-${i}`} className={styles.slide}>
              <Image
                src={src}
                alt={alt}
                fill
                sizes="(max-width: 640px) 70vw, (max-width: 1024px) 40vw, 220px"
                className={styles.image}
                priority={i === 0}
              />
            </div>
          ))}
        </div>
      </div>

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
        </>
      ) : null}
    </div>
  );
}


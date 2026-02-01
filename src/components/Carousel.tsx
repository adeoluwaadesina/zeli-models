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
  const [viewerOpen, setViewerOpen] = React.useState(false);
  const [viewerIdx, setViewerIdx] = React.useState(0);
  const viewerRef = React.useRef<HTMLDivElement | null>(null);
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

  const goTo = React.useCallback(
    (targetIdx: number) => {
      if (len <= 0) return;
      const nextIdx = ((targetIdx % len) + len) % len;
      // Do the scroll inside the user gesture handler (more reliable on mobile)
      scrollToIndex(nextIdx);
      setIdx(nextIdx);
    },
    [len, scrollToIndex]
  );

  const prev = React.useCallback(() => {
    goTo(idx - 1);
  }, [goTo, idx]);

  const next = React.useCallback(() => {
    goTo(idx + 1);
  }, [goTo, idx]);

  const viewerScrollToIndex = React.useCallback((target: number) => {
    const el = viewerRef.current;
    if (!el) return;
    el.scrollTo({ left: target * el.clientWidth, behavior: "smooth" });
  }, []);

  const openViewer = React.useCallback(
    (startIndex: number) => {
      const nextIdx = clamp(0, startIndex, Math.max(0, len - 1));
      setViewerIdx(nextIdx);
      setViewerOpen(true);
    },
    [len]
  );

  const closeViewer = React.useCallback(() => {
    setViewerOpen(false);
  }, []);

  const viewerPrev = React.useCallback(() => {
    if (len <= 0) return;
    const nextIdx = (viewerIdx - 1 + len) % len;
    setViewerIdx(nextIdx);
    viewerScrollToIndex(nextIdx);
  }, [len, viewerIdx, viewerScrollToIndex]);

  const viewerNext = React.useCallback(() => {
    if (len <= 0) return;
    const nextIdx = (viewerIdx + 1) % len;
    setViewerIdx(nextIdx);
    viewerScrollToIndex(nextIdx);
  }, [len, viewerIdx, viewerScrollToIndex]);

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

  // Lightbox: lock background scroll + handle keyboard controls.
  React.useEffect(() => {
    if (!viewerOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeViewer();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        viewerPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        viewerNext();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    // Ensure initial position after the overlay mounts.
    const raf = requestAnimationFrame(() => viewerScrollToIndex(viewerIdx));

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [closeViewer, viewerIdx, viewerNext, viewerOpen, viewerPrev, viewerScrollToIndex]);

  // Lightbox: keep viewerIdx in sync with free scrolling.
  React.useEffect(() => {
    if (!viewerOpen) return;
    const el = viewerRef.current;
    if (!el) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const w = el.clientWidth || 1;
        const nextIdx = clamp(0, Math.round(el.scrollLeft / w), len - 1);
        setViewerIdx(nextIdx);
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
    };
  }, [len, viewerOpen]);

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
              <button
                type="button"
                className={styles.slideBtn}
                onClick={() => {
                  if (isDragging) return;
                  openViewer(i);
                }}
                aria-label="Open image viewer"
              >
                <Image
                  src={src}
                  alt={alt}
                  fill
                  sizes="(max-width: 640px) 70vw, (max-width: 1024px) 40vw, 220px"
                  className={styles.image}
                  priority={i === 0}
                />
              </button>
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

      {viewerOpen ? (
        <div
          className={styles.viewerOverlay}
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeViewer();
          }}
        >
          <div className={styles.viewer}>
            <div className={styles.viewerHeader}>
              <div className={styles.viewerCount} aria-live="polite">
                {viewerIdx + 1} / {len}
              </div>
              <button type="button" className={styles.viewerClose} onClick={closeViewer}>
                Close
              </button>
            </div>

            <div className={styles.viewerViewport} ref={viewerRef}>
              <div className={styles.viewerTrack}>
                {images.map((src, i) => (
                  <div key={`viewer-${src}-${i}`} className={styles.viewerSlide}>
                    {/* Use <img> so we show the original URL with no Next/Image optimization. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className={styles.viewerImg} src={src} alt={alt} />
                  </div>
                ))}
              </div>
            </div>

            {len > 1 ? (
              <>
                <button
                  type="button"
                  className={`${styles.viewerNav} ${styles.viewerLeft}`}
                  onClick={viewerPrev}
                  aria-label="Previous image"
                >
                  <IconChevronLeft className={styles.icon} />
                </button>
                <button
                  type="button"
                  className={`${styles.viewerNav} ${styles.viewerRight}`}
                  onClick={viewerNext}
                  aria-label="Next image"
                >
                  <IconChevronRight className={styles.icon} />
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}


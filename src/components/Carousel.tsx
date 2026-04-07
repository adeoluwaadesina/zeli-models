"use client";

import Image from "next/image";
import * as React from "react";
import styles from "./Carousel.module.css";
import { IconChevronLeft, IconChevronRight, IconFullscreen, IconFullscreenExit } from "./icons";

function clamp(min: number, value: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

// Fullscreen helpers with WebKit prefix for mobile Safari / older browsers
function getFullscreenElement(): Element | null {
  return (
    document.fullscreenElement ??
    (document as Document & { webkitFullscreenElement?: Element }).webkitFullscreenElement ??
    null
  );
}
function requestFullscreen(el: HTMLElement): Promise<void> {
  if (el.requestFullscreen) return el.requestFullscreen();
  const webkit = (el as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen;
  if (webkit) return webkit.call(el);
  return Promise.reject(new Error("Fullscreen not supported"));
}
function exitFullscreen(): Promise<void> {
  if (document.exitFullscreen) return document.exitFullscreen();
  const webkit = (document as Document & { webkitExitFullscreen?: () => Promise<void> }).webkitExitFullscreen;
  if (webkit) return webkit.call(document);
  return Promise.reject(new Error("Exit fullscreen not supported"));
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
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const viewerContainerRef = React.useRef<HTMLDivElement | null>(null);
  const swipeStartX = React.useRef<number | null>(null);
  const dragRef = React.useRef<{
    active: boolean;
    pointerId: number | null;
    startX: number;
    startScrollLeft: number;
    /** True only after pointer has moved past threshold (so click opens viewer on desktop). */
    dragging: boolean;
    /** True if this pointer session was a drag (so we don't open viewer on release). */
    didDrag: boolean;
  }>({ active: false, pointerId: null, startX: 0, startScrollLeft: 0, dragging: false, didDrag: false });

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

  // Larger tiles, portrait 4:5 for model cards; viewportW is from ResizeObserver so scales on mobile too.
  const gap = 12;
  const tileW = clamp(160, viewportW * 0.52, 260);
  const tileH = Math.round(tileW * (5 / 4)); // 4:5 portrait
  const tile = tileW; // step uses width

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

  const openViewer = React.useCallback(
    (startIndex: number) => {
      const nextIdx = clamp(0, startIndex, Math.max(0, len - 1));
      setViewerIdx(nextIdx);
      setViewerOpen(true);
    },
    [len]
  );

  const closeViewer = React.useCallback(() => {
    if (getFullscreenElement()) {
      exitFullscreen().catch(() => {});
    }
    setViewerOpen(false);
    setIsFullscreen(false);
  }, []);

  const toggleFullscreen = React.useCallback(() => {
    const el = viewerContainerRef.current;
    if (!el) return;
    if (getFullscreenElement()) {
      exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    } else {
      requestFullscreen(el).then(() => setIsFullscreen(true)).catch(() => {});
    }
  }, []);

  const viewerPrev = React.useCallback(() => {
    if (len <= 0) return;
    setViewerIdx((i) => (i - 1 + len) % len);
  }, [len]);

  const viewerNext = React.useCallback(() => {
    if (len <= 0) return;
    setViewerIdx((i) => (i + 1) % len);
  }, [len]);

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

  // Sync fullscreen state when user exits via Escape or browser UI (including WebKit).
  React.useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(!!getFullscreenElement());
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", onFullscreenChange);
    };
  }, []);

  // Lightbox: lock background scroll + handle keyboard controls.
  React.useEffect(() => {
    if (!viewerOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (getFullscreenElement()) {
          exitFullscreen().catch(() => {});
        } else {
          closeViewer();
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        viewerPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        viewerNext();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [closeViewer, viewerNext, viewerOpen, viewerPrev]);

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

  const DRAG_THRESHOLD_PX = 6;

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return; // touch/trackpad: native scrolling
    const el = viewportRef.current;
    if (!el) return;
    dragRef.current = {
      active: true,
      pointerId: e.pointerId,
      startX: e.clientX,
      startScrollLeft: el.scrollLeft,
      dragging: false,
      didDrag: false
    };
    // Do NOT setPointerCapture here - it would steal pointerup from the button so click never fires.
    // We only capture once we've passed the drag threshold (in onPointerMove).
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = viewportRef.current;
    if (!el) return;
    if (!dragRef.current.active) return;
    if (dragRef.current.pointerId !== e.pointerId) return;
    const dx = e.clientX - dragRef.current.startX;
    if (!dragRef.current.dragging) {
      if (Math.abs(dx) >= DRAG_THRESHOLD_PX) {
        dragRef.current.dragging = true;
        dragRef.current.didDrag = true;
        setIsDragging(true);
        el.setPointerCapture(e.pointerId);
      } else return;
    }
    el.scrollLeft = dragRef.current.startScrollLeft - dx;
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = viewportRef.current;
    if (!el) return;
    if (!dragRef.current.active) return;
    if (dragRef.current.pointerId !== e.pointerId) return;
    const wasDragging = dragRef.current.dragging;
    dragRef.current.active = false;
    dragRef.current.pointerId = null;
    dragRef.current.dragging = false;
    // Leave didDrag so button onClick can skip opening viewer; cleared on next pointer down
    setIsDragging(false);

    if (wasDragging) {
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
    }
  };

  return (
    <div
      className={styles.frame}
      style={
        {
          ["--tile" as never]: `${tileW}px`,
          ["--tile-height" as never]: `${tileH}px`,
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
                  if (dragRef.current.didDrag) return;
                  openViewer(i);
                }}
                aria-label="Open image viewer"
              >
                <Image
                  src={src}
                  alt={alt}
                  fill
                  sizes="(max-width: 640px) 85vw, (max-width: 1024px) 45vw, 280px"
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
          <div className={styles.viewer} ref={viewerContainerRef}>
            <div className={styles.viewerHeader}>
              <div className={styles.viewerToolbar}>
                <span className={styles.viewerCount} aria-live="polite">
                  {viewerIdx + 1} / {len}
                </span>
                {len > 1 ? (
                  <>
                    <button
                      type="button"
                      className={styles.viewerToolBtn}
                      onClick={viewerPrev}
                      aria-label="Previous image"
                    >
                      <IconChevronLeft className={styles.viewerToolIcon} />
                    </button>
                    <button
                      type="button"
                      className={styles.viewerToolBtn}
                      onClick={viewerNext}
                      aria-label="Next image"
                    >
                      <IconChevronRight className={styles.viewerToolIcon} />
                    </button>
                  </>
                ) : null}
              </div>
              <div className={styles.viewerToolbar}>
                <button
                  type="button"
                  className={styles.viewerToolBtn}
                  onClick={toggleFullscreen}
                  aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                >
                  {isFullscreen ? (
                    <IconFullscreenExit className={styles.viewerToolIcon} />
                  ) : (
                    <IconFullscreen className={styles.viewerToolIcon} />
                  )}
                </button>
                <button type="button" className={styles.viewerClose} onClick={closeViewer}>
                  Close
                </button>
              </div>
            </div>

            <div
              className={styles.viewerBody}
              onTouchStart={(e) => {
                if (len <= 1) return;
                swipeStartX.current = e.touches[0].clientX;
              }}
              onTouchEnd={(e) => {
                if (len <= 1 || swipeStartX.current === null) return;
                const endX = e.changedTouches[0].clientX;
                const dx = endX - swipeStartX.current;
                swipeStartX.current = null;
                if (Math.abs(dx) < 40) return;
                if (dx > 0) viewerPrev();
                else viewerNext();
              }}
            >
              {images[viewerIdx] != null ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  className={styles.viewerImg}
                  src={images[viewerIdx]}
                  alt={alt}
                  draggable={false}
                />
              ) : null}
              {len > 1 ? (
                <p className={styles.viewerHint} aria-hidden="true">
                  Swipe or use arrows to change image
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}


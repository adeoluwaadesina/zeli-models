"use client";

import * as React from "react";
import styles from "./SplashScreen.module.css";

type Props = {
  /** If true, show once per tab session. */
  oncePerSession?: boolean;
  /** How long to stay visible before fading out. */
  minDurationMs?: number;
};

export function SplashScreen({ oncePerSession = true, minDurationMs = 900 }: Props) {
  const [mounted, setMounted] = React.useState(false);
  const [leaving, setLeaving] = React.useState(false);

  React.useEffect(() => {
    // Only decide in the client to avoid hydration mismatch.
    if (oncePerSession) {
      try {
        const seen = sessionStorage.getItem("zeli:splash:seen");
        if (seen === "1") return;
        sessionStorage.setItem("zeli:splash:seen", "1");
      } catch {
        // ignore (private mode, etc.)
      }
    }
    setMounted(true);

    const t = window.setTimeout(() => setLeaving(true), Math.max(0, minDurationMs));
    const u = window.setTimeout(() => setMounted(false), Math.max(0, minDurationMs) + 520);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(u);
    };
  }, [minDurationMs, oncePerSession]);

  if (!mounted) return null;

  return (
    <div
      className={`${styles.overlay} ${leaving ? styles.overlayLeaving : ""}`}
      aria-hidden="true"
    >
      <div className={styles.center}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/zeli-logo-light-transparent.png"
          alt=""
          width={420}
          height={268}
          className={styles.logoImg}
          decoding="async"
        />
        <div className={styles.loader}>
          <div className={styles.bar} />
        </div>
      </div>
    </div>
  );
}

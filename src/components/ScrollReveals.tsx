"use client";

import { usePathname } from "next/navigation";
import * as React from "react";

/**
 * Observes every [data-reveal] element and adds .is-revealed when it enters
 * the viewport. Styling lives in globals.css; elements without the attribute
 * are untouched. Respects prefers-reduced-motion (elements shown immediately).
 */
export function ScrollReveals() {
  const pathname = usePathname();

  React.useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!els.length) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-revealed"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}

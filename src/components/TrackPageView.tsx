"use client";

import { usePathname } from "next/navigation";
import * as React from "react";

/** Fires one beacon per page navigation on the public site. Renders nothing. */
export function TrackPageView() {
  const pathname = usePathname();
  const lastTracked = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    if (lastTracked.current === pathname) return;
    lastTracked.current = pathname;

    const payload = JSON.stringify({
      path: pathname,
      referrer: document.referrer || ""
    });

    try {
      const blob = new Blob([payload], { type: "application/json" });
      if (!navigator.sendBeacon?.("/api/track", blob)) {
        void fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true
        });
      }
    } catch {
      // Analytics must never break the page.
    }
  }, [pathname]);

  return null;
}

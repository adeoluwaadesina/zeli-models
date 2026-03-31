"use client";

import { usePathname } from "next/navigation";
import * as React from "react";

function scrollToFooter() {
  if (typeof window === "undefined" || window.location.hash !== "#footer") return;
  const el = document.getElementById("footer");
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export function FooterHashScroll() {
  const pathname = usePathname();

  React.useEffect(() => {
    scrollToFooter();
    const t = window.setTimeout(() => scrollToFooter(), 80);
    return () => {
      window.clearTimeout(t);
    };
  }, [pathname]);

  React.useEffect(() => {
    const onHash = () => {
      window.requestAnimationFrame(() => scrollToFooter());
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return null;
}

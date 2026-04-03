"use client";

import { usePathname } from "next/navigation";
import * as React from "react";
import { whatsappNumberE164 } from "@/lib/contact";
import styles from "./WhatsappButton.module.css";
import { IconWhatsapp } from "./icons";

export function WhatsappButton() {
  const pathname = usePathname();
  const showOnPath =
    pathname === "/" || pathname === "/become-a-model" || pathname === "/book-a-model";
  if (!showOnPath) {
    return null;
  }

  const message = encodeURIComponent("Hi Zeli Models — I’d like to make an inquiry.");

  const href = `https://wa.me/${whatsappNumberE164}?text=${message}`;

  return (
    <div className={styles.wrap}>
      <a
        className={styles.btn}
        href={href}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
      >
        <IconWhatsapp className={styles.icon} />
        <span className={styles.text}>Chat on WhatsApp</span>
      </a>
    </div>
  );
}


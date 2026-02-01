import * as React from "react";
import styles from "./WhatsappButton.module.css";
import { IconWhatsapp } from "./icons";

export function WhatsappButton() {
  // TODO (you): replace with the real WhatsApp number, e.g. "2348012345678"
  const whatsappNumberE164NoPlus = "12125550199";
  const message = encodeURIComponent("Hi Zeli Models — I’d like to make an inquiry.");

  const href = `https://wa.me/${whatsappNumberE164NoPlus}?text=${message}`;

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


import * as React from "react";
import { phoneDisplay, whatsappNumberE164 } from "@/lib/contact";
import styles from "./ContactSection.module.css";

export function ContactSection() {
  const email = "Zelimodels@gmail.com";
  const phone = phoneDisplay();
  const telHref = `tel:+${whatsappNumberE164}`;

  return (
    <section className={styles.section} id="contact" aria-label="Contact">
      <div className="container">
        <h2 className={styles.title}>Let's Connect</h2>
        <div className={styles.hairlineWrap}>
          <div className="hairline" />
        </div>

        <div className={styles.grid}>
          <div className={styles.item}>
            <p className={styles.label}>Email</p>
            <p className={styles.value}>
              <a href={`mailto:${email}`}>{email}</a>
            </p>
          </div>
          <div className={styles.item}>
            <p className={styles.label}>Phone</p>
            <p className={styles.value}>
              <a href={telHref}>{phone}</a>
            </p>
          </div>
        </div>

        <div className={styles.footerLine} />
        <div className={styles.adminRow}>
          <a className={styles.adminLink} href="/admin">
            Admin
          </a>
        </div>
        <p className={styles.copyright}>
          © {new Date().getFullYear()} Zeli Models. All Rights Reserved.
        </p>
      </div>
    </section>
  );
}


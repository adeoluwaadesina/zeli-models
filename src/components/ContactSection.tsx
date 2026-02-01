import * as React from "react";
import styles from "./ContactSection.module.css";

export function ContactSection() {
  // TODO (you): replace with real business details
  const email = "bookings@zelimodels.com";
  const phone = "+1 (212) 555-0199";

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
              <a href={`tel:${phone.replace(/[^\d+]/g, "")}`}>{phone}</a>
            </p>
          </div>
        </div>

        <div className={styles.footerLine} />
        <p className={styles.copyright}>
          © {new Date().getFullYear()} Zeli Models. All Rights Reserved. | Premium
          Talent Management
        </p>
      </div>
    </section>
  );
}


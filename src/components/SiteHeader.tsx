import Link from "next/link";
import * as React from "react";
import styles from "./SiteHeader.module.css";

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className="container">
        <div className={styles.inner}>
          <Link href="/" className={styles.brand} aria-label="Zeli Models home">
            <span className={styles.brandTop}>ZELI</span>
            <span className={styles.brandBottom}>MODELS</span>
          </Link>

          <nav className={styles.nav} aria-label="Primary">
            <a className={styles.navLink} href="#contact">
              Contact
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}


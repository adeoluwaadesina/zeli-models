import * as React from "react";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section className={styles.hero} aria-label="Zeli Models introduction">
      <div className="container">
        <div className={styles.inner}>
          <div>
            <h1 className={styles.title}>ZELI</h1>
            <p className={styles.subtitle}>Discover Exceptional Talent</p>
            <div className={styles.hairlineWrap}>
              <div className="hairline" />
            </div>
            <p className={styles.copy}>
              Representing the most talented and versatile models. Premium
              management for runway, editorial, and commercial projects.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}


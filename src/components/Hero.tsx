import * as React from "react";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section className={styles.hero} aria-label="Zeli Models introduction">
      <div className="container">
        <div className={styles.inner}>
          <div>
            <h1 className={styles.title}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/hero-logo.jpg"
                alt="Zeli"
                className={styles.heroLogo}
              />
            </h1>
            <p className={styles.copy}>
              A selection of passionate and reliable models offering quality
              talent you can trust for every project.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}


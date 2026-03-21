import Link from "next/link";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section className={styles.hero} aria-label="Zeli Models introduction">
      <div className={styles.deco} aria-hidden="true" />
      <div className={styles.deco2} aria-hidden="true" />
      <div className="container">
        <div className={styles.inner}>
          <p className={styles.established}>
            <span className={styles.estLine} aria-hidden="true" />
            <span>Established 2025</span>
            <span className={styles.estLine} aria-hidden="true" />
          </p>
          <h1 className={styles.headline}>Defining Modern Beauty</h1>
          <p className={styles.sub}>
            An elite modeling agency curating the world&apos;s most captivating faces for luxury
            fashion, editorial, and commercial campaigns.
          </p>
          <div className={styles.ctas}>
            <Link className={styles.btnPrimary} href="/women">
              Discover talent
            </Link>
            <Link className={styles.btnGhost} href="/#contact">
              Book a consultation
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

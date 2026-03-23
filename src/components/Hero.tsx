import Link from "next/link";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section className={styles.hero} aria-label="Zeli Models introduction">
      <div className={styles.deco} aria-hidden="true" />
      <div className={styles.deco2} aria-hidden="true" />
      <div className="container">
        <div className={styles.inner}>
          <h1 className={styles.headline}>
            <span className={`${styles.headlineRow} ${styles.headlineDefining}`}>Defining</span>
            <span className={styles.headlineRow}>
              <span className={styles.headlineModern}>Modern</span>{" "}
              <span className={styles.headlineBeauty}>Beauty</span>
            </span>
          </h1>
          <p className={styles.sub}>
            An elite modeling agency curating the world&apos;s most captivating faces for luxury
            fashion, editorial, and commercial campaigns.
          </p>
          <div className={styles.ctas}>
            <Link className={styles.btnPrimary} href="/women">
              Discover talent
            </Link>
            <Link className={styles.btnGhost} href="/become-a-model">
              Become a model
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

import * as React from "react";
import styles from "./OurStorySection.module.css";

function IconEye(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <path
        fill="currentColor"
        d="M12 5c-5.33 0-9.73 4.11-11 7 1.27 2.89 5.67 7 11 7s9.73-4.11 11-7c-1.27-2.89-5.67-7-11-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-2.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
      />
    </svg>
  );
}

function IconStar(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <path
        fill="currentColor"
        d="M12 2.5 14.95 8.8l6.85.63-5.2 4.48 1.56 6.7L12 17.95 3.84 20.61l1.56-6.7-5.2-4.48 6.85-.63L12 2.5Z"
      />
    </svg>
  );
}

function IconDiamond(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <path fill="currentColor" d="M12 2 22 12 12 22 2 12 12 2z" />
    </svg>
  );
}

export function OurStorySection() {
  return (
    <section className={styles.section} id="our-story" aria-label="Our Story">
      <div className="container">
        <div className={styles.headingStack}>
          <p className={styles.kicker}>Our Story</p>
          <h2 className={styles.title}>
            <span className={styles.titleLine}>Where Vision Meets </span>
            <span className={styles.titleElegance}>Elegance</span>
          </h2>
          <div className={styles.hairlineWrap}>
            <div className="hairline" />
          </div>
        </div>

        <p className={styles.body}>
          At Zeli Models, we bring creativity and sophistication to every project. Each model brings
          unique energy and style, shaping campaigns with a distinct identity. From concept to
          final image, we partner closely with clients to craft experiences and visuals that are
          memorable and fully aligned with your vision.
        </p>

        <div className={styles.cards}>
          <div className={styles.card}>
            <IconEye className={styles.cardIcon} aria-hidden="true" />
            <p className={styles.cardTitle}>Vision</p>
            <p className={styles.cardText}>
              We see the potential in every idea and bring it to life.
            </p>
          </div>

          <div className={styles.card}>
            <IconStar className={styles.cardIcon} aria-hidden="true" />
            <p className={styles.cardTitle}>Impact</p>
            <p className={styles.cardText}>
              Our work leaves a lasting impression on every audience.
            </p>
          </div>

          <div className={styles.card}>
            <IconDiamond className={styles.cardIcon} aria-hidden="true" />
            <p className={styles.cardTitle}>Talent</p>
            <p className={styles.cardText}>Our models stand out effortlessly.</p>
          </div>
        </div>
      </div>
    </section>
  );
}


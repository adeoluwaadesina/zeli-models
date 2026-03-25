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

export function OurStorySection() {
  return (
    <section className={styles.section} id="our-story" aria-label="Our story">
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.left}>
            <p className={styles.kicker}>Our story</p>
            <h2 className={styles.title}>Where vision meets elegance</h2>

            <p className={styles.body}>
              At Zeli Models, we bring creativity and sophistication to every project. Each model
              brings unique energy and style, shaping campaigns with a distinct identity. From
              concept to final image, we partner closely with clients to craft experiences and
              visuals that are memorable and fully aligned with your vision.
            </p>

            <div className={styles.items}>
              <div className={styles.item}>
                <IconEye className={styles.icon} />
                <div className={styles.itemTextWrap}>
                  <p className={styles.itemLabel}>Vision</p>
                  <p className={styles.itemText}>We see the potential in every idea and bring it to life</p>
                </div>
              </div>

              <div className={styles.item}>
                <IconStar className={styles.icon} />
                <div className={styles.itemTextWrap}>
                  <p className={styles.itemLabel}>Impact</p>
                  <p className={styles.itemText}>Our work leaves a lasting impression on every audience</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.right} aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}


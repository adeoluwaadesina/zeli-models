import * as React from "react";
import styles from "./OurStorySection.module.css";

const PILLARS = [
  {
    title: "Vision",
    text: "We see the potential in every idea and bring it to life."
  },
  {
    title: "Impact",
    text: "Our work leaves a lasting impression on every audience."
  },
  {
    title: "Talent",
    text: "Our models stand out effortlessly."
  }
];

export function OurStorySection() {
  return (
    <section className={styles.section} id="our-story" aria-label="Our Story">
      <div className="container">
        <div className={styles.split}>
          <div className={styles.headingCol} data-reveal>
            <p className={styles.kicker}>Our story</p>
            <h2 className={styles.title}>
              <span className={styles.titleLine}>Where vision</span>
              <span className={styles.titleLine}>
                meets <span className={styles.titleElegance}>elegance</span>
              </span>
            </h2>
          </div>

          <div className={styles.bodyCol}>
            <p className={styles.body} data-reveal>
              At Zeli Models, we bring creativity and sophistication to every project. Each model
              brings unique energy and style, shaping campaigns with a distinct identity. From
              concept to final image, we partner closely with clients to craft experiences and
              visuals that are memorable and fully aligned with your vision.
            </p>

            <dl className={styles.pillars}>
              {PILLARS.map((p, idx) => (
                <div
                  key={p.title}
                  className={styles.pillar}
                  data-reveal
                  style={{ ["--reveal-delay" as string]: `${idx * 0.1}s` }}
                >
                  <dt className={styles.pillarTitle}>{p.title}</dt>
                  <dd className={styles.pillarText}>{p.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

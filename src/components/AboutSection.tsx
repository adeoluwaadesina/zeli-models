import styles from "./AboutSection.module.css";

export function AboutSection() {
  return (
    <section className={styles.section} id="about" aria-labelledby="about-heading">
      <div className="container">
        <p className={styles.kicker}>About us</p>
        <h2 id="about-heading" className={styles.title}>
          A boutique agency with global reach
        </h2>
        <p className={styles.body}>
          Zeli Models represents passionate, reliable talent for luxury fashion, editorial, and
          commercial work. We focus on long-term relationships—matching the right face to the right
          brief, with professionalism at every step.
        </p>
      </div>
    </section>
  );
}

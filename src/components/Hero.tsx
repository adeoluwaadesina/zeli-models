import Link from "next/link";
import type { ZeliModel } from "@/data/models";
import { getFeaturedModels } from "@/data/models";
import { portfolioDisplayName } from "@/lib/displayName";
import styles from "./Hero.module.css";

function coverSrc(m: ZeliModel): string | null {
  const u = m.featuredImageUrl?.trim();
  if (u) return u;
  return m.images[0] ?? null;
}

export function Hero({ models }: { models: ZeliModel[] }) {
  const featured = getFeaturedModels(models, 4).filter((m) => coverSrc(m));
  const primary = featured[0] ?? null;
  const secondary = featured[1] ?? null;

  return (
    <section className={styles.hero} aria-label="Zeli Models introduction">
      <div className={styles.frame}>
        <div className={styles.copy}>
          <p className={styles.kicker} data-reveal>
            Zeli Models — Talent Management
          </p>
          <h1 className={styles.headline}>
            <span className={`${styles.headlineRow} ${styles.headlineDefining}`} data-reveal>
              Redefining
            </span>
            <span
              className={styles.headlineRow}
              data-reveal
              style={{ ["--reveal-delay" as string]: "0.12s" }}
            >
              <span className={styles.headlineModern}>Modern</span>{" "}
              <span className={styles.headlineBeauty}>Beauty</span>
            </span>
          </h1>
          <p className={styles.sub} data-reveal style={{ ["--reveal-delay" as string]: "0.22s" }}>
            A modeling agency representing a curated roster of talent for campaigns and creative
            projects, reflecting the evolving face of modern beauty.
          </p>
          <div className={styles.ctas} data-reveal style={{ ["--reveal-delay" as string]: "0.3s" }}>
            <Link className={styles.btnPrimary} href="/women">
              Discover talent
            </Link>
            <Link className={styles.btnGhost} href="/book-a-model">
              Book a model
            </Link>
          </div>
        </div>

        {primary ? (
          <div className={styles.stage} aria-hidden="true">
            <Link
              href={`/models/${primary.id}`}
              className={styles.portrait}
              tabIndex={-1}
              data-reveal
              style={{ ["--reveal-delay" as string]: "0.15s" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverSrc(primary)!} alt="" className={styles.portraitImg} />
              <span className={styles.portraitTag}>{portfolioDisplayName(primary.name)}</span>
            </Link>
            {secondary ? (
              <Link
                href={`/models/${secondary.id}`}
                className={styles.portraitSmall}
                tabIndex={-1}
                data-reveal
                style={{ ["--reveal-delay" as string]: "0.32s" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverSrc(secondary)!} alt="" className={styles.portraitImg} />
                <span className={styles.portraitTag}>{portfolioDisplayName(secondary.name)}</span>
              </Link>
            ) : null}
          </div>
        ) : (
          <div className={styles.stage} aria-hidden="true">
            <div className={`${styles.portrait} ${styles.portraitEmpty}`} data-reveal />
          </div>
        )}
      </div>
    </section>
  );
}

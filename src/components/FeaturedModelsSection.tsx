import Link from "next/link";
import type { ZeliModel } from "@/data/models";
import { getFeaturedModels, tagsDisplayLine } from "@/data/models";
import { portfolioDisplayName } from "@/lib/displayName";
import styles from "./FeaturedModelsSection.module.css";

function coverSrc(m: ZeliModel): string | null {
  const u = m.featuredImageUrl?.trim();
  if (u) return u;
  return m.images[0] ?? null;
}

export function FeaturedModelsSection({ models }: { models: ZeliModel[] }) {
  const featured = getFeaturedModels(models, 4);

  return (
    <section className={styles.section} id="featured" aria-labelledby="featured-heading">
      <div className="container">
        <div className={styles.headerRow} data-reveal>
          <div>
            <p className={styles.kicker}>Our roster</p>
            <h2 id="featured-heading" className={styles.title}>
              Featured <span className={styles.titleItalic}>models</span>
            </h2>
          </div>
          <Link className={styles.rosterLink} href="/women">
            View full roster
            <span className={styles.rosterArrow} aria-hidden="true">
              →
            </span>
          </Link>
        </div>

        {featured.length === 0 ? (
          <p className={styles.empty}>
            Featured models will appear here once marked in the admin portal.
          </p>
        ) : (
          <div className={styles.grid}>
            {featured.map((m, idx) => {
              const cover = coverSrc(m);
              const tags = tagsDisplayLine(m.tags);
              return (
                <Link
                  key={m.id}
                  href={`/models/${m.id}`}
                  className={styles.card}
                  data-reveal
                  style={{ ["--reveal-delay" as string]: `${idx * 0.08}s` }}
                >
                  <div className={styles.media}>
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cover} alt={m.name} className={styles.img} />
                    ) : (
                      <div className={styles.placeholder} aria-hidden="true" />
                    )}
                    <span className={styles.index} aria-hidden="true">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className={styles.caption}>
                    <span className={styles.name}>{portfolioDisplayName(m.name)}</span>
                    {tags ? <span className={styles.tags}>{tags}</span> : null}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

import Link from "next/link";
import type { ZeliModel } from "@/data/models";
import { getFeaturedModels } from "@/data/models";
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
        <div className={styles.headerRow}>
          <div>
            <p className={styles.kicker}>Our Roster</p>
            <h2 id="featured-heading" className={styles.title}>
              Featured Models
            </h2>
          </div>
          <p className={styles.blurb}>
            A Glimpse Of Our Talent
          </p>
        </div>

        {featured.length === 0 ? (
          <p className={styles.empty}>
            Featured models will appear here once marked in the admin portal.
          </p>
        ) : (
          <>
            <div className={styles.grid}>
              {featured.map((m) => {
                const cover = coverSrc(m);
                return (
                  <Link
                    key={m.id}
                    href={`/models/${m.id}`}
                    className={styles.card}
                    aria-label={m.name}
                  >
                    <div className={styles.media}>
                      {cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={cover} alt="" className={styles.img} />
                      ) : (
                        <div className={styles.placeholder} aria-hidden="true" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className={styles.ctaRow}>
              <Link className={styles.ctaButton} href="/women">
                View Full Roster
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

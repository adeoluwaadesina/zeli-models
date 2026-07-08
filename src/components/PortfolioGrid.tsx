import Link from "next/link";
import type { ZeliModel } from "@/data/models";
import { tagsDisplayLine } from "@/data/models";
import { portfolioDisplayName } from "@/lib/displayName";
import styles from "./PortfolioGrid.module.css";

export function PortfolioGrid({
  title,
  subtitle,
  models
}: {
  title: string;
  subtitle?: string;
  models: ZeliModel[];
}) {
  return (
    <section className={styles.section} aria-label={title}>
      <div className="container container--portfolio">
        <header className={styles.header} data-reveal>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{title}</h1>
            <span className={styles.count} aria-label={`${models.length} models`}>
              {String(models.length).padStart(2, "0")}
            </span>
          </div>
          {subtitle ? <p className={styles.sub}>{subtitle}</p> : null}
        </header>

        {models.length === 0 ? (
          <p className={styles.empty}>Models will appear here once added in the admin portal.</p>
        ) : (
          <div className={styles.grid}>
            {models.map((m, idx) => {
              const src = m.images[0];
              const tags = tagsDisplayLine(m.tags);
              return (
                <Link
                  key={m.id}
                  href={`/models/${m.id}`}
                  className={styles.cell}
                  data-reveal
                  style={{ ["--reveal-delay" as string]: `${(idx % 4) * 0.07}s` }}
                >
                  <div className={styles.imgWrap}>
                    {src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={src} alt={m.name} className={styles.img} />
                    ) : (
                      <div className={styles.ph} aria-hidden="true" />
                    )}
                    <span className={styles.viewTag} aria-hidden="true">
                      View portfolio
                    </span>
                  </div>
                  <p className={styles.name}>{portfolioDisplayName(m.name)}</p>
                  {tags ? <p className={styles.tags}>{tags}</p> : null}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

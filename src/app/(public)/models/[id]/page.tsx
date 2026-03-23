import { ModelDetailGallery } from "@/components/ModelDetailGallery";
import { portfolioDisplayName } from "@/lib/displayName";
import { readModelById } from "@/lib/modelsStore";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const model = await readModelById(id);
  if (!model) return { title: "Model | Zeli Models" };
  return { title: `${model.name} | Zeli Models` };
}

export default async function ModelDetailPage({ params }: Props) {
  const { id } = await params;
  const model = await readModelById(id);
  if (!model) notFound();

  const boardHref = model.gender === "male" ? "/men" : "/women";
  const boardLabel = model.gender === "male" ? "Male" : "Female";

  const rows: { label: string; value: string }[] = [
    { label: "Height", value: model.heightCm ? `${model.height} / ${model.heightCm}` : model.height },
    { label: "Chest", value: model.chest },
    { label: "Waist", value: model.waist },
    { label: "Shoe", value: model.shoe },
    { label: "Eyes", value: model.eyes },
    { label: "Hair", value: model.hair }
  ].filter((r) => r.value.trim().length > 0);

  return (
    <main className={styles.main}>
      <div className={styles.toolbar}>
        <div className="container">
          <Link href={boardHref} className={styles.back}>
            ← {boardLabel}
          </Link>
        </div>
      </div>

      <div className={styles.split}>
        <div className={styles.left}>
          <h1 className={styles.name}>{portfolioDisplayName(model.name)}</h1>
          {model.bio.trim() ? <p className={styles.bio}>{model.bio}</p> : null}
          {rows.length ? (
            <dl className={styles.stats}>
              {rows.map((r) => (
                <div key={r.label} className={styles.statRow}>
                  <dt>{r.label}</dt>
                  <dd>{r.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
        <div className={styles.right}>
          <ModelDetailGallery images={model.images} alt={model.name} />
        </div>
      </div>
    </main>
  );
}

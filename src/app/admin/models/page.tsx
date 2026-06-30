import { readModels } from "@/lib/modelsStore";
import { requireAdmin } from "@/lib/requireAdmin";
import { AdminClientIsland } from "../AdminClientIsland";
import styles from "../page.module.css";

export default async function AdminModelsPage() {
  await requireAdmin("/admin/models");
  const models = await readModels();

  const stats = [
    { label: "Total roster", value: models.length },
    { label: "Featured", value: models.filter((m) => m.featured).length, accent: true },
    { label: "Women", value: models.filter((m) => m.gender === "female").length },
    { label: "Men", value: models.filter((m) => m.gender === "male").length }
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageIntro}>
        <div className="container">
          <p className={styles.kicker}>Roster</p>
          <h1 className={styles.title}>Models</h1>
          <p className={styles.subtitle}>
            Reorder the roster, edit profiles, upload images, and choose featured models for the
            homepage.
          </p>
        </div>
      </div>
      <div className="container">
        <div className={styles.statsBand}>
          {stats.map((s) => (
            <div key={s.label} className={styles.statCard}>
              <span className={`${styles.statValue} ${s.accent ? styles.statValueAccent : ""}`}>
                {s.value}
              </span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
        <AdminClientIsland initial={models} />
      </div>
    </div>
  );
}

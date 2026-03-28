import { readModels } from "@/lib/modelsStore";
import { requireAdmin } from "@/lib/requireAdmin";
import { AdminClientIsland } from "../AdminClientIsland";
import styles from "../page.module.css";

export default async function AdminModelsPage() {
  await requireAdmin("/admin/models");
  const models = await readModels();

  return (
    <div className={styles.page}>
      <div className={styles.pageIntro}>
        <div className="container">
          <h1 className={styles.title}>Models</h1>
          <p className={styles.subtitle}>
            Reorder the roster, edit profiles, upload images, and choose featured models for the
            homepage.
          </p>
        </div>
      </div>
      <div className="container">
        <AdminClientIsland initial={models} />
      </div>
    </div>
  );
}

import { requireAdmin } from "@/lib/requireAdmin";
import { AdminSitePanel } from "../AdminSitePanel";
import styles from "../page.module.css";

export default async function AdminSitePage() {
  await requireAdmin("/admin/site");

  return (
    <div className={styles.page}>
      <div className={styles.pageIntro}>
        <div className="container">
          <p className={styles.kicker}>Homepage</p>
          <h1 className={styles.title}>Site content</h1>
          <p className={styles.subtitle}>
            Marquee line, What we do carousel, values, and other homepage copy and imagery.
          </p>
        </div>
      </div>
      <div className="container">
        <AdminSitePanel />
      </div>
    </div>
  );
}

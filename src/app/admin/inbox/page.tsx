import { requireAdmin } from "@/lib/requireAdmin";
import { AdminInboxPanel } from "../AdminInboxPanel";
import styles from "../page.module.css";

export default async function AdminInboxPage() {
  await requireAdmin("/admin/inbox");

  return (
    <div className={styles.page}>
      <div className={styles.pageIntro}>
        <div className="container">
          <p className={styles.kicker}>Leads</p>
          <h1 className={styles.title}>Inbox</h1>
          <p className={styles.subtitle}>
            Contact form leads and model applications. Open a row to read details and mark as read
            or reviewed.
          </p>
        </div>
      </div>
      <div className="container">
        <AdminInboxPanel />
      </div>
    </div>
  );
}

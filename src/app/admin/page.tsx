import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE } from "@/lib/adminAuth";
import { readModels } from "@/lib/modelsStore";
import { AdminInboxPanel } from "./AdminInboxPanel";
import { AdminClientIsland } from "./AdminClientIsland";
import { AdminSitePanel } from "./AdminSitePanel";
import styles from "./page.module.css";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const authed = cookieStore.get(ADMIN_COOKIE)?.value === "1";
  if (!authed) {
    redirect("/admin/login?next=/admin");
  }

  const models = await readModels();

  return (
    <main className={styles.page}>
      <div className={styles.top}>
        <div className="container">
          <div className={styles.topRow}>
            <div>
              <Link className={styles.homeLink} href="/">
                ← Zeli Models home
              </Link>
              <h1 className={styles.title}>Zeli Models Admin</h1>
              <p className={styles.subtitle}>
                Manage models, site copy, featured roster, and review contact / application
                submissions.
              </p>
            </div>
            <div className={styles.topActions}>
              <a className={`${styles.btn} ${styles.linkBtn}`} href="/admin/logout">
                Logout
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <AdminClientIsland initial={models} />
        <AdminSitePanel />
        <AdminInboxPanel />
      </div>
    </main>
  );
}


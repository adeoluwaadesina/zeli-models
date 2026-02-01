import * as React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE } from "@/lib/adminAuth";
import { readModels } from "@/lib/modelsStore";
import styles from "./page.module.css";
import { AdminClientIsland } from "./AdminClientIsland";

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
              <h1 className={styles.title}>Zeli Models Admin</h1>
              <p className={styles.subtitle}>
                Manage the portfolio ordering now. Next step is persistence so
                the owner can add/edit models and upload 5 images per model.
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
      </div>
    </main>
  );
}


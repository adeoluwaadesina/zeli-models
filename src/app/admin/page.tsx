import * as React from "react";
import { MODELS } from "@/data/models";
import styles from "./page.module.css";
import { AdminClient } from "./AdminClient";

export default function AdminPage() {
  return (
    <main className={styles.page}>
      <div className={styles.top}>
        <div className="container">
          <h1 className={styles.title}>Zeli Models Admin</h1>
          <p className={styles.subtitle}>
            This is a starter admin panel scaffold. Next step is to add login +
            persistence (database) so the owner can add/edit models, upload 5
            images per model, and reorder the portfolio.
          </p>
        </div>
      </div>

      <div className="container">
        <AdminClient initial={MODELS} />
      </div>
    </main>
  );
}


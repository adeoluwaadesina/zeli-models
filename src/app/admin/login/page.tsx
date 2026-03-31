import Link from "next/link";
import * as React from "react";
import styles from "./page.module.css";
import { PasswordField } from "./PasswordField";

export default function AdminLoginPage({
  searchParams
}: {
  searchParams?: { error?: string; next?: string };
}) {
  const nextPath = searchParams?.next ?? "/admin/models";
  const showError = searchParams?.error === "1";

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <Link href="/" className={styles.brand} aria-label="Zeli Models home">
          <span className={styles.brandTop}>ZELI</span>
          <span className={styles.brandBottom}>MODELS</span>
        </Link>

        <h1 className={styles.title}>Admin Login</h1>
        <p className={styles.subtitle}>
          Enter the owner credentials to access the admin panel.
        </p>

        <form
          className={styles.form}
          method="post"
          action="/api/admin/login"
          suppressHydrationWarning
        >
          <input type="hidden" name="next" value={nextPath} />

          <div className={styles.field}>
            <label className={styles.label} htmlFor="username">
              Username
            </label>
            <input
              className={styles.input}
              id="username"
              name="username"
              autoComplete="username"
              required
              suppressHydrationWarning
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <PasswordField
              inputClassName={styles.input}
              wrapClassName={styles.passwordWrap}
              toggleClassName={styles.toggleBtn}
            />
          </div>

          <div className={styles.actions}>
            <span className={styles.hint}>Protected area</span>
            <button
              className={`${styles.btn} ${styles.btnPrimary}`}
              type="submit"
              suppressHydrationWarning
            >
              Sign in
            </button>
          </div>

          {showError ? (
            <div className={styles.error} role="alert">
              Invalid username or password.
            </div>
          ) : null}
        </form>
      </div>
    </main>
  );
}


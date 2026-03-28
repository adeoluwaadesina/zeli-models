"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import styles from "./AdminShell.module.css";

const NAV = [
  { href: "/admin/models", label: "Models" },
  { href: "/admin/site", label: "Site content" },
  { href: "/admin/inbox", label: "Inbox" }
] as const;

export function AdminShellClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login" || pathname?.startsWith("/admin/login");

  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  if (isLogin) {
    return <>{children}</>;
  }

  const closeMenu = () => setMenuOpen(false);

  const navLinks = (opts: { onNavigate?: () => void }) =>
    NAV.map((item) => {
      const active = pathname === item.href;
      return (
        <Link
          key={item.href}
          href={item.href}
          className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
          onClick={opts.onNavigate}
          aria-current={active ? "page" : undefined}
        >
          {item.label}
        </Link>
      );
    });

  const bottomTabs = (
    <nav className={styles.bottomTabs} aria-label="Admin primary">
      {NAV.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.bottomTab} ${active ? styles.bottomTabActive : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <span className={styles.bottomTabLabel}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const navBody = (
    <>
      <p className={styles.brand}>Zeli Admin</p>
      <nav className={styles.nav} aria-label="Admin sections">
        <p className={styles.navLabel}>Sections</p>
        {navLinks({ onNavigate: closeMenu })}
      </nav>
      <div className={styles.footer}>
        <Link className={styles.footerLink} href="/" onClick={closeMenu}>
          ← Site home
        </Link>
        <a className={styles.footerLink} href="/admin/logout">
          Logout
        </a>
      </div>
    </>
  );

  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.backdrop} ${menuOpen ? styles.backdropVisible : ""}`}
        aria-hidden="true"
        onClick={closeMenu}
      />
      <aside className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ""}`} aria-label="Admin menu">
        {navBody}
      </aside>
      <div className={styles.main}>
        <div className={styles.topBar}>
          <button
            type="button"
            className={styles.menuBtn}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className={styles.menuIcon} aria-hidden>
              <span />
              <span />
              <span />
            </span>
          </button>
          <p className={styles.topBarTitle}>Zeli Admin</p>
          <span aria-hidden />
        </div>
        <div className={styles.mainScroll}>
          <main id="admin-dashboard-main">{children}</main>
        </div>
        {bottomTabs}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import styles from "./AppHeader.module.css";

type NavItem = { href: string; label: string; external?: boolean };

const NAV: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/women", label: "Female" },
  { href: "/men", label: "Male" },
  { href: "/become-a-model", label: "Become a model" },
  { href: "/#footer", label: "Contact" }
];

function isNavActive(href: string, pathname: string, routeHash: string): boolean {
  if (href === "/") {
    return pathname === "/" && routeHash !== "#footer";
  }
  if (href === "/women") return pathname === "/women";
  if (href === "/men") return pathname === "/men";
  if (href === "/book-a-model") return pathname === "/book-a-model";
  if (href === "/become-a-model") return pathname === "/become-a-model";
  if (href.startsWith("/#")) {
    return pathname === "/" && routeHash === href.slice(1);
  }
  return false;
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width={22} height={22} aria-hidden="true">
      <path
        fill="currentColor"
        d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8A3.6 3.6 0 0 0 20 16.4V7.6A3.6 3.6 0 0 0 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"
      />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width={22} height={22} aria-hidden="true">
      <path
        fill="currentColor"
        d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.71 2.89 2.89 0 0 1 2.31-4.64V7.05a6.32 6.32 0 1 0 5.33 6.23V8.36a8.16 8.16 0 0 0 4.78 1.54V6.69h-.0z"
      />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width={22} height={22} aria-hidden="true">
      <path
        fill="currentColor"
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
      />
    </svg>
  );
}

export function AppHeader({
  instagramUrl,
  tiktokUrl,
  twitterHref
}: {
  instagramUrl: string;
  tiktokUrl: string;
  twitterHref: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [routeHash, setRouteHash] = React.useState("");
  const showIg = Boolean(instagramUrl.trim());

  React.useEffect(() => {
    const syncHash = () => setRouteHash(typeof window !== "undefined" ? window.location.hash : "");
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [pathname]);

  React.useEffect(() => {
    if (open && typeof window !== "undefined") {
      setRouteHash(window.location.hash);
    }
  }, [open]);

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <header className={styles.header}>
        <div className={`container ${styles.inner}`}>
          <Link href="/" className={styles.logo} aria-label="Zeli home">
            {/* Plain img: next/image warns when CSS max-width/max-height scales the logo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.jpg"
              alt=""
              width={296}
              height={74}
              className={styles.logoImg}
              fetchPriority="high"
              decoding="async"
            />
          </Link>

          <nav className={styles.desktopNav} aria-label="Primary">
            {NAV.map((item) => {
              const active = isNavActive(item.href, pathname, routeHash);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navLink} ${active ? styles.navActive : ""}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className={styles.mobileBar}>
            <div className={styles.mobileSocial} aria-label="Social links">
              {showIg ? (
                <a
                  className={styles.socialIconBtn}
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <InstagramIcon />
                </a>
              ) : null}
              <a
                className={styles.socialIconBtn}
                href={tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
              >
                <TikTokIcon />
              </a>
              {twitterHref ? (
                <a
                  className={styles.socialIconBtn}
                  href={twitterHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X (Twitter)"
                >
                  <TwitterIcon />
                </a>
              ) : (
                <button type="button" className={styles.socialIconBtn} aria-label="Twitter (coming soon)">
                  <TwitterIcon />
                </button>
              )}
            </div>
            <button
              type="button"
              className={styles.menuBtn}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              <span className={styles.menuIcon} aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            </button>
          </div>
        </div>
      </header>

      {open ? (
        <div
          id="mobile-menu"
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div className={styles.overlayTop}>
            <Link
              href="/"
              className={styles.overlayLogo}
              onClick={() => setOpen(false)}
              aria-label="Zeli Models home"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- same light wordmark as SiteFooter */}
              <img
                src="/zeli-logo-light-transparent.png"
                alt=""
                width={230}
                height={147}
                className={styles.overlayLogoImg}
                decoding="async"
              />
            </Link>
            <button
              type="button"
              className={styles.closeBtn}
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </div>
          <nav className={styles.overlayNav} aria-label="Mobile primary">
            {NAV.map((item) => {
              const active = isNavActive(item.href, pathname, routeHash);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.overlayLink} ${active ? styles.overlayActive : ""}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className={styles.overlaySocial} aria-label="Social links">
            {showIg ? (
              <a
                className={styles.overlaySocialBtn}
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
            ) : null}
            <a
              className={styles.overlaySocialBtn}
              href={tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
            >
              <TikTokIcon />
            </a>
            {twitterHref ? (
              <a
                className={styles.overlaySocialBtn}
                href={twitterHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
              >
                <TwitterIcon />
              </a>
            ) : (
              <button type="button" className={styles.overlaySocialBtn} aria-label="Twitter (coming soon)">
                <TwitterIcon />
              </button>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

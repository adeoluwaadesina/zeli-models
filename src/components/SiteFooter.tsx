import { phoneDisplay, whatsappNumberE164 } from "@/lib/contact";
import { resolveInstagramUrl } from "@/lib/instagram";
import { resolveTiktokUrl, resolveTwitterHref } from "@/lib/socialUrls";
import { readSiteSettings } from "@/lib/siteSettingsStore";
import Link from "next/link";
import styles from "./SiteFooter.module.css";

const EMAIL = "Zelimodels@gmail.com";

const FOOTER_ABOUT =
  "A modeling agency representing a curated roster of talent for campaigns and creative projects.";

const FOOTER_ADDRESS_LINES = ["Victoria Island", "Lagos, Nigeria"];

const BUSINESS_HOURS_LINES = [
  "Mon - Sat: 9:00am – 5:00pm",
  "Sunday: 10:00am – 5:00pm"
];

function IconPin({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width={20} height={20} aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"
      />
    </svg>
  );
}

function IconPhone({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width={20} height={20} aria-hidden="true">
      <path
        fill="currentColor"
        d="M6.62 10.79a15.15 15.15 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.07 21 3 13.93 3 5a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.25 1.01l-2.2 2.2z"
      />
    </svg>
  );
}

function IconMail({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width={20} height={20} aria-hidden="true">
      <path
        fill="currentColor"
        d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5L4 8V6l8 5 8-5v2z"
      />
    </svg>
  );
}

function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width={19} height={19} aria-hidden="true">
      <path
        fill="currentColor"
        d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8A3.6 3.6 0 0 0 20 16.4V7.6A3.6 3.6 0 0 0 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"
      />
    </svg>
  );
}

function TikTokGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width={19} height={19} aria-hidden="true">
      <path
        fill="currentColor"
        d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.71 2.89 2.89 0 0 1 2.31-4.64V7.05a6.32 6.32 0 1 0 5.33 6.23V8.36a8.16 8.16 0 0 0 4.78 1.54V6.69h-.0z"
      />
    </svg>
  );
}

function TwitterGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width={19} height={19} aria-hidden="true">
      <path
        fill="currentColor"
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
      />
    </svg>
  );
}

export async function SiteFooter({ showAdminLink = false }: { showAdminLink?: boolean } = {}) {
  const phone = phoneDisplay();
  const telHref = `tel:+${whatsappNumberE164}`;
  const settings = await readSiteSettings();
  const instagramUrl = resolveInstagramUrl(settings);
  const tiktokUrl = resolveTiktokUrl(settings);
  const twitterHref = resolveTwitterHref(settings);

  return (
    <footer id="footer" className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.left}>
          <div className={styles.leftStack}>
            <Link href="/" className={styles.logoLink} aria-label="Zeli Models home">
              {/* eslint-disable-next-line @next/next/no-img-element -- raster wordmark with blend on footer gradient */}
              <img
                src="/zeli-logo-light-transparent.png"
                alt=""
                width={230}
                height={147}
                className={styles.logoImgLight}
                decoding="async"
              />
            </Link>
            <p className={styles.about}>{FOOTER_ABOUT}</p>
            <div className={styles.social}>
              {instagramUrl ? (
                <a
                  className={styles.socialBtn}
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <InstagramGlyph />
                </a>
              ) : null}
              <a
                className={styles.socialBtn}
                href={tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
              >
                <TikTokGlyph />
              </a>
              {twitterHref ? (
                <a
                  className={styles.socialBtn}
                  href={twitterHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X (Twitter)"
                >
                  <TwitterGlyph />
                </a>
              ) : (
                <button type="button" className={styles.socialBtn} aria-label="Twitter (coming soon)">
                  <TwitterGlyph />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className={styles.right}>
          <h2 className={styles.contactHeading}>Contact info</h2>
          <ul className={styles.contactList}>
            <li className={styles.contactRow}>
              <IconPin className={styles.rowIcon} />
              <div className={styles.rowBody}>
                {FOOTER_ADDRESS_LINES.map((line) => (
                  <span key={line} className={styles.rowLine}>
                    {line}
                  </span>
                ))}
              </div>
            </li>
            <li className={styles.contactRow}>
              <IconPhone className={styles.rowIcon} />
              <a className={styles.rowLink} href={telHref}>
                {phone}
              </a>
            </li>
            <li className={styles.contactRow}>
              <IconMail className={styles.rowIcon} />
              <a className={styles.rowLink} href={`mailto:${EMAIL}`}>
                {EMAIL}
              </a>
            </li>
          </ul>
          <div className={styles.hoursBlock}>
            <h3 className={styles.hoursHeading}>Business hours</h3>
            <ul className={styles.hoursList}>
              {BUSINESS_HOURS_LINES.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className={`container ${styles.bottomBar}`}>
        <div className={styles.bottomLeft}>
          {showAdminLink ? (
            <a className={styles.adminLink} href="/admin/models">
              Admin
            </a>
          ) : null}
          <p className={styles.copy}>
            © {new Date().getFullYear()} Zeli Models. All rights reserved.
          </p>
        </div>
        <div className={styles.legal}>
          <Link className={styles.legalLink} href="/privacy">
            Privacy Policy
          </Link>
          <Link className={styles.legalLink} href="/terms">
            Terms and Conditions
          </Link>
        </div>
      </div>
    </footer>
  );
}

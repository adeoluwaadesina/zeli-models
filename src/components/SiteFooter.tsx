import { phoneDisplay, whatsappNumberE164 } from "@/lib/contact";
import { resolveInstagramUrl } from "@/lib/instagram";
import { readSiteSettings } from "@/lib/siteSettingsStore";
import styles from "./SiteFooter.module.css";

const EMAIL = "Zelimodels@gmail.com";

export async function SiteFooter({ showAdminLink = false }: { showAdminLink?: boolean } = {}) {
  const settings = await readSiteSettings();
  const ig = resolveInstagramUrl(settings);
  const phone = phoneDisplay();
  const telHref = `tel:+${whatsappNumberE164}`;

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.row}>
          <div>
            <p className={styles.label}>Email</p>
            <a className={styles.link} href={`mailto:${EMAIL}`}>
              {EMAIL}
            </a>
          </div>
          <div>
            <p className={styles.label}>Phone</p>
            <a className={styles.link} href={telHref}>
              {phone}
            </a>
          </div>
          {ig ? (
            <div>
              <p className={styles.label}>Instagram</p>
              <a className={styles.link} href={ig} target="_blank" rel="noopener noreferrer">
                Follow us
              </a>
            </div>
          ) : null}
        </div>
        {showAdminLink ? (
          <div className={styles.adminRow}>
            <a className={styles.adminLink} href="/admin">
              Admin
            </a>
          </div>
        ) : null}
        <p className={styles.copy}>© {new Date().getFullYear()} Zeli Models. All Rights Reserved.</p>
      </div>
    </footer>
  );
}

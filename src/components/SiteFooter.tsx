import { phoneDisplay, whatsappNumberE164 } from "@/lib/contact";
import styles from "./SiteFooter.module.css";

const EMAIL = "Zelimodels@gmail.com";

/** Edit these lines to match your studio address (shown under the pin icon). */
const FOOTER_ADDRESS_LINES = ["Lagos", "Nigeria"];

const BUSINESS_HOURS_LINES = [
  "Mon - Saturday: 9:00-5:00pm",
  "Sunday: 10:00-5:00pm"
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

export function SiteFooter({ showAdminLink = false }: { showAdminLink?: boolean } = {}) {
  const phone = phoneDisplay();
  const telHref = `tel:+${whatsappNumberE164}`;

  return (
    <footer id="footer" className={styles.footer}>
      <div className={`container ${styles.footInner}`}>
        <div className={styles.contactBlock}>
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

        {showAdminLink ? (
          <div className={styles.adminRow}>
            <a className={styles.adminLink} href="/admin">
              Admin
            </a>
          </div>
        ) : null}

        <div className={styles.bottomBar}>
          <p className={styles.copy}>© {new Date().getFullYear()} Zeli Models. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

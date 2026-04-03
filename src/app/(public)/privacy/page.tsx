import { SiteFooter } from "@/components/SiteFooter";
import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Privacy policy — Zeli Models"
};

export default function PrivacyPage() {
  return (
    <main className={styles.main}>
      <div className={`container ${styles.inner}`}>
        <header className={styles.header}>
          <p className={styles.kicker}>Legal</p>
          <h1 className={styles.title}>Zeli Models — Privacy policy</h1>
          <p className={styles.effective}>
            <strong>Effective date:</strong> February 7, 2026
          </p>
        </header>

        <article className={styles.article}>
          <section>
            <h2>1. Introduction</h2>
            <p>
              Zeli Models (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is a modeling agency
              representing independent talent for fashion, editorial, and commercial projects. We are
              committed to protecting your personal data and respecting your privacy.
            </p>
            <p>This Privacy Policy explains how we collect, use, store, and protect your information when you:</p>
            <ul>
              <li>Visit our website or social media pages</li>
              <li>Apply to become a model</li>
              <li>Book or inquire about our models</li>
              <li>Communicate with us via email, forms, or direct messages</li>
            </ul>
          </section>

          <section>
            <h2>2. Information we collect</h2>
            <h3>a. Personal information</h3>
            <p>We may collect:</p>
            <ul>
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Location (city/country)</li>
              <li>Date of birth</li>
              <li>Gender</li>
              <li>Nationality</li>
            </ul>
            <h3>b. Model-specific information</h3>
            <p>For talent applications and representation:</p>
            <ul>
              <li>Height, measurements, and physical attributes</li>
              <li>Portfolio images and digitals</li>
              <li>Social media handles</li>
              <li>Work experience</li>
              <li>Availability</li>
            </ul>
            <h3>c. Client information</h3>
            <p>For brands, photographers, and collaborators:</p>
            <ul>
              <li>Company name</li>
              <li>Contact details</li>
              <li>Project details</li>
              <li>Budget and booking requirements</li>
            </ul>
            <h3>d. Technical data</h3>
            <p>When you interact with our platforms:</p>
            <ul>
              <li>IP address</li>
              <li>Device type</li>
              <li>Browser type</li>
              <li>Usage data (via cookies or analytics tools)</li>
            </ul>
          </section>

          <section>
            <h2>3. How we use your information</h2>
            <p>We use collected data to:</p>
            <ul>
              <li>Manage model applications and representation</li>
              <li>Connect models with brands and clients</li>
              <li>Process bookings and inquiries</li>
              <li>Communicate updates, opportunities, and confirmations</li>
              <li>Improve our services and platform</li>
              <li>Ensure safety, compliance, and professionalism</li>
            </ul>
          </section>

          <section>
            <h2>4. How we share information</h2>
            <p>We may share information with:</p>
            <h3>a. Clients &amp; brands</h3>
            <ul>
              <li>Model portfolios, images, and relevant details for booking consideration</li>
            </ul>
            <h3>b. Industry professionals</h3>
            <ul>
              <li>Photographers, stylists, and casting directors for legitimate opportunities</li>
            </ul>
            <h3>c. Service providers</h3>
            <ul>
              <li>Email platforms, hosting providers, or analytics tools that support our operations</li>
            </ul>
            <h3>d. Legal requirements</h3>
            <p>When required by law or to protect our rights.</p>
            <p>We do not sell personal data to third parties.</p>
          </section>

          <section>
            <h2>5. Model image &amp; portfolio usage</h2>
            <p>By submitting images or working with Zeli Models:</p>
            <ul>
              <li>
                You grant us permission to use your images for:
                <ul>
                  <li>Portfolio display</li>
                  <li>Marketing and promotional purposes</li>
                  <li>Social media content</li>
                </ul>
              </li>
              <li>You confirm you have rights to all submitted content</li>
            </ul>
          </section>

          <section>
            <h2>6. Data storage &amp; security</h2>
            <p>We take reasonable steps to protect your data:</p>
            <ul>
              <li>Secure storage systems</li>
              <li>Restricted access to personal information</li>
              <li>Regular monitoring for unauthorized access</li>
            </ul>
            <p>However, no system is 100% secure, and we cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2>7. Your rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Request access to your data</li>
              <li>Request corrections</li>
              <li>Request deletion of your information (subject to legal agreement)</li>
              <li>Opt out of marketing communications</li>
            </ul>
            <p>
              To exercise these rights, contact us at:{" "}
              <a href="mailto:zelimodels@gmail.com">zelimodels@gmail.com</a>
            </p>
          </section>

          <section>
            <h2>8. Retention of data</h2>
            <p>We retain personal data:</p>
            <ul>
              <li>As long as necessary for agency operations</li>
              <li>Until a deletion request is made</li>
              <li>As required for legal or business purposes</li>
            </ul>
          </section>

          <section>
            <h2>9. Cookies &amp; tracking</h2>
            <p>We may use cookies or similar technologies to:</p>
            <ul>
              <li>Improve user experience</li>
              <li>Analyze traffic</li>
              <li>Optimize content</li>
            </ul>
            <p>You can disable cookies in your browser settings.</p>
          </section>

          <section>
            <h2>10. Third-party links</h2>
            <p>
              Our platforms may contain links to external sites. We are not responsible for their privacy
              practices.
            </p>
          </section>

          <section>
            <h2>11. Changes to this policy</h2>
            <p>
              We may update this Privacy Policy at any time. Updates will be posted with a revised
              effective date.
            </p>
          </section>

          <section>
            <h2>12. Contact us</h2>
            <p>
              <strong>Email:</strong>{" "}
              <a href="mailto:zelimodels@gmail.com">zelimodels@gmail.com</a>
              <br />
              <strong>Location:</strong> Lagos, Nigeria
            </p>
          </section>
        </article>

        <p className={styles.back}>
          <Link href="/">← Back to home</Link>
        </p>
      </div>
      <SiteFooter />
    </main>
  );
}

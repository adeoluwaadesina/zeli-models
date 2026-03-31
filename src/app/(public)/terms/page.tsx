import { SiteFooter } from "@/components/SiteFooter";
import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Terms and conditions — Zeli Models"
};

export default function TermsPage() {
  return (
    <main className={styles.main}>
      <div className={`container ${styles.inner}`}>
        <header className={styles.header}>
          <p className={styles.kicker}>Legal</p>
          <h1 className={styles.title}>Terms and conditions</h1>
          <p className={styles.intro}>
            These terms describe how you may use this website and how we handle enquiries submitted
            through our forms. Replace this placeholder with counsel-reviewed text before relying on it
            legally.
          </p>
        </header>

        <article className={styles.article}>
          <section>
            <h2>1. Use of the site</h2>
            <p>
              Content on this site is for information about Zeli Models and our roster. You agree not to
              misuse the site, attempt unauthorized access, or use automated tools to scrape data without
              permission.
            </p>
          </section>
          <section>
            <h2>2. Applications and bookings</h2>
            <p>
              Information you submit via &quot;Become a model&quot; or &quot;Book a model&quot; must be
              accurate to the best of your knowledge. Submission does not guarantee representation or
              booking; we may follow up by email or phone.
            </p>
          </section>
          <section>
            <h2>3. Photos and uploads</h2>
            <p>
              By uploading images, you confirm you have the right to share them for the purpose stated in
              the form. We use uploads only as described in our processes and applicable law.
            </p>
          </section>
          <section>
            <h2>4. Changes</h2>
            <p>
              We may update these terms from time to time. The updated version will be posted on this page
              with a revised date when you edit this copy.
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

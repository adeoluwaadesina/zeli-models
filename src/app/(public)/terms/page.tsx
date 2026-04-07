import { SiteFooter } from "@/components/SiteFooter";
import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Terms and conditions - Zeli Models"
};

export default function TermsPage() {
  return (
    <main className={styles.main}>
      <div className={`container ${styles.inner}`}>
        <header className={styles.header}>
          <p className={styles.kicker}>Legal</p>
          <h1 className={styles.title}>Zeli Models - Terms and conditions</h1>
          <p className={styles.effective}>
            <strong>Effective date:</strong> February 7, 2026
          </p>
        </header>

        <article className={styles.article}>
          <section>
            <h2>Overview</h2>
            <p>These Terms govern the use of Zeli Models&apos; services by:</p>
            <ul>
              <li>Models (talent)</li>
              <li>Clients (brands, photographers, agencies)</li>
              <li>Website and social media users</li>
            </ul>
            <p>By engaging with Zeli Models, you agree to these Terms.</p>
          </section>

          <section>
            <h2>Services provided</h2>
            <p>Zeli Models:</p>
            <ul>
              <li>Represents independent models</li>
              <li>Connects talent with brands and creatives</li>
              <li>Facilitates bookings and collaborations</li>
            </ul>
            <p>We do not guarantee:</p>
            <ul>
              <li>Job placement</li>
              <li>Income</li>
              <li>Continuous work opportunities</li>
            </ul>
          </section>

          <section>
            <h2>Model representation</h2>
            <h3>a. Independent talent</h3>
            <p>Models represented by Zeli Models may operate as independent contractors.</p>
            <h3>b. Conduct expectations</h3>
            <p>Models must:</p>
            <ul>
              <li>Be professional and punctual</li>
              <li>Maintain communication</li>
              <li>Deliver agreed work</li>
            </ul>
            <p>Failure may result in removal from the agency.</p>
          </section>

          <section>
            <h2>Bookings &amp; payments</h2>
            <h3>a. Booking process</h3>
            <p>All bookings should be confirmed through Zeli Models where applicable.</p>
            <h3>b. Fees &amp; commission</h3>
            <ul>
              <li>Zeli Models may charge a commission on jobs sourced through the agency</li>
              <li>Commission terms may vary and will be communicated clearly</li>
            </ul>
            <h3>Payment responsibility</h3>
            <ul>
              <li>Clients must pay agreed fees on time</li>
              <li>Late payments may affect future collaborations</li>
            </ul>
          </section>

          <section>
            <h2>Client responsibilities</h2>
            <p>Clients agree to:</p>
            <ul>
              <li>Provide clear project details</li>
              <li>Respect model safety and boundaries</li>
              <li>Use images only for agreed purposes</li>
            </ul>
            <p>Unauthorized usage may result in legal action.</p>
          </section>

          <section>
            <h2>Booking process</h2>
            <p>
              All bookings must be confirmed in writing, including agreed rates, dates, and project
              details. Any changes made after confirmation may result in additional charges.
            </p>
          </section>

          <section>
            <h2>Payment terms</h2>
            <ul>
              <li>A 50% deposit is required to secure all bookings</li>
              <li>The remaining balance must be paid on or before the shoot day, prior to commencement</li>
              <li>Bookings will not proceed without full payment</li>
              <li>Travel and accommodation expenses are additional</li>
            </ul>
          </section>

          <section>
            <h2>Content usage rights</h2>
            <p>Unless otherwise agreed:</p>
            <ul>
              <li>Clients receive limited rights to use images for specified purposes</li>
              <li>Models retain rights to their image</li>
              <li>Zeli Models may use content for promotional purposes</li>
            </ul>
          </section>

          <section>
            <h2>Cancellations</h2>
            <ul>
              <li>Cancellations must be communicated in advance</li>
              <li>Late cancellations may incur fees</li>
              <li>No-shows may result in restrictions or termination of services</li>
            </ul>
          </section>

          <section>
            <h2>Intellectual property</h2>
            <p>
              All branding, content, and materials belonging to Zeli Models remain our property unless
              stated otherwise.
            </p>
          </section>

          <section>
            <h2>Limitation of liability</h2>
            <p>Zeli Models is not liable for:</p>
            <ul>
              <li>Loss of income</li>
              <li>Missed opportunities</li>
              <li>Third-party actions</li>
            </ul>
            <p>We act as a facilitator, not an employer.</p>
          </section>

          <section>
            <h2>Indemnification</h2>
            <p>
              You agree to indemnify and hold Zeli Models harmless against any claims, damages, or expenses
              resulting from your use of our services or any breach of these Terms.
            </p>
          </section>

          <section>
            <h2>Termination</h2>
            <p>We reserve the right to:</p>
            <ul>
              <li>Remove models from representation</li>
              <li>Refuse service to clients</li>
              <li>Terminate access for misuse</li>
            </ul>
          </section>

          <section>
            <h2>Governing law</h2>
            <p>These Terms are governed by the laws of Nigeria.</p>
          </section>

          <section>
            <h2>Updates to terms</h2>
            <p>
              We may update these Terms at any time. Continued use of our services means you accept the
              updated version.
            </p>
          </section>

          <section>
            <h2>Contact</h2>
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

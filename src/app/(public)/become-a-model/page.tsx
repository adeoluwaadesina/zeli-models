import { ApplyModelForm } from "@/components/ApplyModelForm";
import { SiteFooter } from "@/components/SiteFooter";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default function BecomeAModelPage() {
  return (
    <main className={styles.main}>
      <div className="container">
        <header className={styles.header}>
          <h1 className={styles.title}>Become a model</h1>
          <p className={styles.sub}>
            Take the first step toward working with Zeli Models. Complete the form below — our team
            reviews every application.
          </p>
        </header>
        <ApplyModelForm />
      </div>
      <SiteFooter />
    </main>
  );
}

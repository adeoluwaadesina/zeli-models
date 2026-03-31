import { BookModelForm } from "@/components/BookModelForm";
import { SiteFooter } from "@/components/SiteFooter";
import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Book A Model"
};

export const dynamic = "force-dynamic";

export default function BookAModelPage() {
  return (
    <main className={styles.main}>
      <div className={`container ${styles.intro}`}>
        <header className={styles.header}>
          <h1 className={styles.title}>Book A Model</h1>
          <p className={styles.sub}>
            Tell us about your project — casting, campaigns, and partnerships. Our team will follow
            up with you.
          </p>
        </header>
      </div>
      <BookModelForm />
      <SiteFooter />
    </main>
  );
}

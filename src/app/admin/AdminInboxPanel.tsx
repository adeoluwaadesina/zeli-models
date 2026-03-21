"use client";

import * as React from "react";
import styles from "./page.module.css";

type ContactRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  read_flag: boolean;
  created_at: string;
};

type AppRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  country: string;
  state: string;
  city: string;
  height_feet: number;
  height_inches: number;
  portfolio_link: string;
  interests: string[];
  interests_other: string;
  photo_urls: string[];
  status: string;
  created_at: string;
};

function normalizeAppStatus(s: string): "new" | "reviewed" {
  return (s || "").toLowerCase() === "reviewed" ? "reviewed" : "new";
}

export function AdminInboxPanel() {
  const [contacts, setContacts] = React.useState<ContactRow[]>([]);
  const [applications, setApplications] = React.useState<AppRow[]>([]);
  const [status, setStatus] = React.useState("");
  const [openContact, setOpenContact] = React.useState<string | null>(null);
  const [openApp, setOpenApp] = React.useState<string | null>(null);
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/submissions", { cache: "no-store" });
      if (!res.ok) {
        setStatus("Could not load submissions (Supabase required).");
        return;
      }
      const data = (await res.json()) as {
        contacts?: ContactRow[];
        applications?: AppRow[];
      };
      setContacts(data.contacts ?? []);
      setApplications(data.applications ?? []);
      setStatus("");
    } catch {
      setStatus("Network error loading inbox.");
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const copyEmail = async (email: string, key: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      setCopiedKey("copy-fail");
      window.setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const patchContact = async (id: string, readFlag: boolean) => {
    await fetch("/api/admin/submissions", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type: "contact", id, readFlag })
    });
    void load();
  };

  const patchApp = async (id: string, statusVal: "new" | "reviewed") => {
    await fetch("/api/admin/submissions", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type: "application", id, status: statusVal })
    });
    void load();
  };

  return (
    <section className={styles.siteSection} aria-label="Inbox">
      <div className={styles.siteHeader}>
        <h2 className={styles.modalTitle}>Inbox</h2>
        <button className={`${styles.btn} ${styles.btnPrimary}`} type="button" onClick={() => void load()}>
          Refresh
        </button>
      </div>
      {status ? <p className={styles.meta}>{status}</p> : null}

      <div className={styles.inboxGrid}>
        <div className={styles.inboxCol}>
          <h3>Contact form</h3>
          {contacts.length === 0 ? (
            <p className={styles.meta}>No messages yet.</p>
          ) : (
            contacts.map((c) => {
              const contactCopyKey = `contact-${c.id}`;
              return (
              <div
                key={c.id}
                className={`${styles.inboxItem} ${c.read_flag ? styles.inboxItemRead : styles.inboxItemUnread}`}
              >
                <div>
                  <strong>{c.full_name}</strong>
                  <span
                    className={`${styles.readBadge} ${c.read_flag ? styles.badgeReadLabel : styles.badgeUnreadLabel}`}
                  >
                    {c.read_flag ? "Read" : "Unread"}
                  </span>
                  <span className={styles.meta}> — {c.email}</span>
                  <button
                    type="button"
                    className={styles.copyEmailBtn}
                    onClick={() => void copyEmail(c.email, contactCopyKey)}
                  >
                    {copiedKey === contactCopyKey ? "Copied" : "Copy email"}
                  </button>
                </div>
                <div className={styles.meta}>{new Date(c.created_at).toLocaleString()}</div>
                <button
                  className={styles.btn}
                  type="button"
                  onClick={() => setOpenContact(openContact === c.id ? null : c.id)}
                >
                  {openContact === c.id ? "Hide" : "View"}
                </button>
                {openContact === c.id ? (
                  <div className={styles.meta}>
                    <div>Phone: {c.phone}</div>
                    <div>Company: {c.company || "—"}</div>
                    <div className={styles.inboxMessageBody}>{c.message}</div>
                  </div>
                ) : null}
                <button
                  className={styles.btn}
                  type="button"
                  onClick={() => void patchContact(c.id, !c.read_flag)}
                >
                  {c.read_flag ? "Mark unread" : "Mark read"}
                </button>
              </div>
              );
            })
          )}
        </div>

        <div className={styles.inboxCol}>
          <h3>Model applications</h3>
          {applications.length === 0 ? (
            <p className={styles.meta}>No applications yet.</p>
          ) : (
            applications.map((a) => {
              const st = normalizeAppStatus(a.status);
              const copyKey = `app-${a.id}`;
              return (
                <div key={a.id} className={styles.inboxItem}>
                  <div>
                    <strong>
                      {a.first_name} {a.last_name}
                    </strong>
                    <span
                      className={st === "reviewed" ? styles.statusBadgeReviewed : styles.statusBadgeNew}
                    >
                      {st === "reviewed" ? "Reviewed" : "New"}
                    </span>
                    <span className={styles.meta}> — {a.email}</span>
                    <button
                      type="button"
                      className={styles.copyEmailBtn}
                      onClick={() => void copyEmail(a.email, copyKey)}
                    >
                      {copiedKey === copyKey ? "Copied" : "Copy email"}
                    </button>
                  </div>
                  <div className={styles.meta}>{new Date(a.created_at).toLocaleString()}</div>
                  <button
                    className={styles.btn}
                    type="button"
                    onClick={() => setOpenApp(openApp === a.id ? null : a.id)}
                  >
                    {openApp === a.id ? "Hide" : "View"}
                  </button>
                  {openApp === a.id ? (
                    <div className={styles.meta}>
                      <div>
                        {a.city}, {a.state}, {a.country}
                      </div>
                      <div>
                        Height: {a.height_feet}&apos;{a.height_inches}&quot;
                      </div>
                      <div>Interests: {(a.interests || []).join(", ") || "—"}</div>
                      <div>Other: {a.interests_other || "—"}</div>
                      <div>Portfolio: {a.portfolio_link || "—"}</div>
                      <div style={{ marginTop: 10 }}>
                        {(a.photo_urls || []).length === 0 ? (
                          <div>Photos: —</div>
                        ) : (
                          <div>
                            <div style={{ marginBottom: 6 }}>Photos</div>
                            {(a.photo_urls || []).map((u, i) => (
                              <a
                                key={`${a.id}-p-${i}`}
                                className={styles.inboxPhotoLink}
                                href={u}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Open photo {i + 1}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}
                  <button
                    className={styles.btn}
                    type="button"
                    onClick={() => void patchApp(a.id, st === "reviewed" ? "new" : "reviewed")}
                  >
                    {st === "reviewed" ? "Mark new" : "Mark reviewed"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

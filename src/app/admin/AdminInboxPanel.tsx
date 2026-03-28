"use client";

import * as React from "react";
import styles from "./page.module.css";

const ARCHIVE_RETENTION_DAYS = 30;

type ContactRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  read_flag: boolean;
  created_at: string;
  archived_at: string | null;
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
  archived_at: string | null;
};

function normalizeAppStatus(s: string): "new" | "reviewed" {
  return (s || "").toLowerCase() === "reviewed" ? "reviewed" : "new";
}

function displayText(value: string | null | undefined): string {
  const t = (value ?? "").trim();
  return t.length > 0 ? t : "—";
}

function formatAbsolute(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short"
    });
  } catch {
    return iso;
  }
}

function formatRelativeTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return formatAbsolute(iso);

  const diffSec = Math.round((Date.now() - d.getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

  if (diffSec < 10) return "Just now";
  if (diffSec < 60) return rtf.format(-diffSec, "second");

  const min = Math.floor(diffSec / 60);
  if (min < 60) return rtf.format(-min, "minute");

  const hr = Math.floor(min / 60);
  if (hr < 24) return rtf.format(-hr, "hour");

  const day = Math.floor(hr / 24);
  if (day < 7) return rtf.format(-day, "day");

  const week = Math.floor(day / 7);
  if (week < 5) return rtf.format(-week, "week");

  const month = Math.floor(day / 30);
  if (month < 12) return rtf.format(-month, "month");

  const year = Math.floor(day / 365);
  return rtf.format(-Math.max(year, 1), "year");
}

function formatPermanentDeleteAt(archivedAt: string): string {
  const t = new Date(archivedAt).getTime() + ARCHIVE_RETENTION_DAYS * 24 * 60 * 60 * 1000;
  return new Date(t).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function sortContactsUnreadFirst(rows: ContactRow[]): ContactRow[] {
  return [...rows].sort((a, b) => Number(a.read_flag) - Number(b.read_flag));
}

function sortApplicationsNewFirst(rows: AppRow[]): AppRow[] {
  return [...rows].sort((a, b) => {
    const ra = normalizeAppStatus(a.status) === "reviewed" ? 1 : 0;
    const rb = normalizeAppStatus(b.status) === "reviewed" ? 1 : 0;
    return ra - rb;
  });
}

function sortByArchivedAtDesc<T extends { archived_at: string | null }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    const ta = a.archived_at ? new Date(a.archived_at).getTime() : 0;
    const tb = b.archived_at ? new Date(b.archived_at).getTime() : 0;
    return tb - ta;
  });
}

function formatDob(isoOrStr: string): string {
  const t = (isoOrStr ?? "").trim();
  if (!t) return "—";
  const d = new Date(t);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }
  return t;
}

function LabeledField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.inboxFieldRow}>
      <div className={styles.inboxFieldLabel}>{label}</div>
      <div className={styles.inboxFieldValue}>{children}</div>
    </div>
  );
}

function InboxSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <h4 className={styles.inboxSectionTitle}>{title}</h4>
      <div className={styles.inboxFieldList}>{children}</div>
    </>
  );
}

function ContactDetailBody({
  c,
  contactCopyKey,
  copiedKey,
  onCopy,
  onToggleRead,
  showArchivedView,
  onArchive,
  onUnarchive
}: {
  c: ContactRow;
  contactCopyKey: string;
  copiedKey: string | null;
  onCopy: (email: string, key: string) => void;
  onToggleRead: () => void;
  showArchivedView: boolean;
  onArchive: () => void;
  onUnarchive: () => void;
}) {
  const archivedAt = c.archived_at;
  return (
    <>
      {showArchivedView && archivedAt ? (
        <p className={styles.inboxPurgeNotice}>
          Permanently removed on or after{" "}
          <strong>{formatPermanentDeleteAt(archivedAt)}</strong> ({ARCHIVE_RETENTION_DAYS} days after archiving).
        </p>
      ) : null}
      <InboxSection title="Contact">
        <LabeledField label="Name">{displayText(c.full_name)}</LabeledField>
        <LabeledField label="Email">{displayText(c.email)}</LabeledField>
        <LabeledField label="Phone">{displayText(c.phone)}</LabeledField>
        <LabeledField label="Company">{displayText(c.company)}</LabeledField>
        {showArchivedView && archivedAt ? (
          <LabeledField label="Archived">
            <time dateTime={archivedAt}>{formatAbsolute(archivedAt)}</time> ({formatRelativeTime(archivedAt)})
          </LabeledField>
        ) : null}
      </InboxSection>
      <InboxSection title="Message">
        <div className={styles.inboxMessageBody}>{displayText(c.message)}</div>
      </InboxSection>
      <div className={styles.inboxActionRow}>
        <button
          type="button"
          className={`${styles.copyEmailBtn} ${styles.inboxActionBtn}`}
          onClick={() => void onCopy(c.email, contactCopyKey)}
        >
          {copiedKey === contactCopyKey ? "Copied" : "Copy email"}
        </button>
        {!showArchivedView ? (
          <>
            <button className={`${styles.btn} ${styles.inboxActionBtn}`} type="button" onClick={onToggleRead}>
              {c.read_flag ? "Mark unread" : "Mark read"}
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.inboxActionBtn} ${styles.inboxArchiveBtn}`}
              onClick={onArchive}
            >
              Archive
            </button>
          </>
        ) : (
          <button type="button" className={`${styles.btn} ${styles.inboxActionBtn}`} onClick={onUnarchive}>
            Unarchive
          </button>
        )}
      </div>
    </>
  );
}

function ApplicationDetailBody({
  a,
  copyKey,
  copiedKey,
  onCopy,
  onToggleStatus,
  statusNorm,
  showArchivedView,
  onArchive,
  onUnarchive
}: {
  a: AppRow;
  copyKey: string;
  copiedKey: string | null;
  onCopy: (email: string, key: string) => void;
  onToggleStatus: () => void;
  statusNorm: "new" | "reviewed";
  showArchivedView: boolean;
  onArchive: () => void;
  onUnarchive: () => void;
}) {
  const interests = a.interests ?? [];
  const portfolio = (a.portfolio_link ?? "").trim();
  const photos = a.photo_urls ?? [];
  const hf = a.height_feet;
  const hi = a.height_inches;
  const heightStr =
    hf != null && hi != null && !Number.isNaN(Number(hf)) && !Number.isNaN(Number(hi))
      ? `${hf}'${hi}"`
      : "—";
  const archivedAt = a.archived_at;

  return (
    <>
      {showArchivedView && archivedAt ? (
        <p className={styles.inboxPurgeNotice}>
          Permanently removed on or after{" "}
          <strong>{formatPermanentDeleteAt(archivedAt)}</strong> ({ARCHIVE_RETENTION_DAYS} days after archiving).
        </p>
      ) : null}
      <InboxSection title="Identity">
        <LabeledField label="First name">{displayText(a.first_name)}</LabeledField>
        <LabeledField label="Last name">{displayText(a.last_name)}</LabeledField>
        <LabeledField label="Date of birth">{formatDob(a.dob)}</LabeledField>
        <LabeledField label="Gender">{displayText(a.gender)}</LabeledField>
        {showArchivedView && archivedAt ? (
          <LabeledField label="Archived">
            <time dateTime={archivedAt}>{formatAbsolute(archivedAt)}</time> ({formatRelativeTime(archivedAt)})
          </LabeledField>
        ) : null}
      </InboxSection>
      <InboxSection title="Contact">
        <LabeledField label="Email">{displayText(a.email)}</LabeledField>
        <LabeledField label="Phone">{displayText(a.phone)}</LabeledField>
      </InboxSection>
      <InboxSection title="Location">
        <LabeledField label="City">{displayText(a.city)}</LabeledField>
        <LabeledField label="State / region">{displayText(a.state)}</LabeledField>
        <LabeledField label="Country">{displayText(a.country)}</LabeledField>
      </InboxSection>
      <InboxSection title="Profile">
        <LabeledField label="Height">{heightStr}</LabeledField>
        <LabeledField label="Interests">
          {interests.length === 0 ? (
            "—"
          ) : (
            <div className={styles.inboxChipRow}>
              {interests.map((tag) => (
                <span key={tag} className={styles.inboxChip}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </LabeledField>
        <LabeledField label="Other interests">{displayText(a.interests_other)}</LabeledField>
        <LabeledField label="Portfolio">
          {portfolio ? (
            <a className={styles.inboxExternalLink} href={portfolio} target="_blank" rel="noreferrer">
              {portfolio} ↗
            </a>
          ) : (
            "—"
          )}
        </LabeledField>
      </InboxSection>
      <InboxSection title="Photos">
        {photos.length === 0 ? (
          <p className={styles.inboxFieldValue}>—</p>
        ) : (
          <div className={styles.inboxThumbGrid}>
            {photos.map((u, i) => (
              <a
                key={`${a.id}-thumb-${i}`}
                className={styles.inboxThumbLink}
                href={u}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open application photo ${i + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- remote Supabase URLs */}
                <img className={styles.inboxThumb} src={u} alt="" loading="lazy" />
              </a>
            ))}
          </div>
        )}
      </InboxSection>
      <div className={styles.inboxActionRow}>
        <button
          type="button"
          className={`${styles.copyEmailBtn} ${styles.inboxActionBtn}`}
          onClick={() => void onCopy(a.email, copyKey)}
        >
          {copiedKey === copyKey ? "Copied" : "Copy email"}
        </button>
        {!showArchivedView ? (
          <>
            <button className={`${styles.btn} ${styles.inboxActionBtn}`} type="button" onClick={onToggleStatus}>
              {statusNorm === "reviewed" ? "Mark new" : "Mark reviewed"}
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.inboxActionBtn} ${styles.inboxArchiveBtn}`}
              onClick={onArchive}
            >
              Archive
            </button>
          </>
        ) : (
          <button type="button" className={`${styles.btn} ${styles.inboxActionBtn}`} onClick={onUnarchive}>
            Unarchive
          </button>
        )}
      </div>
    </>
  );
}

type InboxView = "active" | "archived";

function normalizeRowArchivedAt(raw: unknown): string | null {
  if (raw == null || raw === "") return null;
  return String(raw);
}

export function AdminInboxPanel() {
  const [inboxView, setInboxView] = React.useState<InboxView>("active");
  const [contacts, setContacts] = React.useState<ContactRow[]>([]);
  const [applications, setApplications] = React.useState<AppRow[]>([]);
  const [status, setStatus] = React.useState("");
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const showArchived = inboxView === "archived";

  const load = React.useCallback(async () => {
    try {
      const q = showArchived ? "?archived=1" : "";
      const res = await fetch(`/api/admin/submissions${q}`, { cache: "no-store" });
      if (!res.ok) {
        setStatus("Could not load submissions (Supabase required).");
        return;
      }
      const data = (await res.json()) as {
        contacts?: Record<string, unknown>[];
        applications?: Record<string, unknown>[];
      };
      const rawContacts = (data.contacts ?? []).map((row) => ({
        ...(row as ContactRow),
        archived_at: normalizeRowArchivedAt(row.archived_at)
      })) as ContactRow[];
      const rawApps = (data.applications ?? []).map((row) => ({
        ...(row as AppRow),
        archived_at: normalizeRowArchivedAt(row.archived_at)
      })) as AppRow[];

      if (showArchived) {
        setContacts(sortByArchivedAtDesc(rawContacts));
        setApplications(sortByArchivedAtDesc(rawApps));
      } else {
        setContacts(sortContactsUnreadFirst(rawContacts));
        setApplications(sortApplicationsNewFirst(rawApps));
      }
      setStatus("");
    } catch {
      setStatus("Network error loading inbox.");
    }
  }, [showArchived]);

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

  const patchContact = async (id: string, body: { readFlag?: boolean; archived?: boolean }) => {
    await fetch("/api/admin/submissions", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type: "contact", id, ...body })
    });
    void load();
  };

  const patchApp = async (id: string, body: { status?: "new" | "reviewed"; archived?: boolean }) => {
    await fetch("/api/admin/submissions", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type: "application", id, ...body })
    });
    void load();
  };

  return (
    <section className={styles.siteSection} aria-label="Inbox">
      <div className={styles.siteHeader}>
        <h2 className={styles.modalTitle}>Inbox</h2>
        <button
          className={`${styles.btn} ${styles.btnPrimary} ${styles.inboxHeaderBtn}`}
          type="button"
          onClick={() => void load()}
        >
          Refresh
        </button>
      </div>

      <div className={styles.inboxViewTabs} role="tablist" aria-label="Inbox views">
        <button
          type="button"
          role="tab"
          aria-selected={!showArchived}
          className={`${styles.inboxViewTab} ${!showArchived ? styles.inboxViewTabActive : ""}`}
          onClick={() => setInboxView("active")}
        >
          Active
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={showArchived}
          className={`${styles.inboxViewTab} ${showArchived ? styles.inboxViewTabActive : ""}`}
          onClick={() => setInboxView("archived")}
        >
          Archived
        </button>
      </div>

      {showArchived ? (
        <p className={styles.inboxArchivePolicy}>
          Archived messages and applications are permanently deleted automatically {ARCHIVE_RETENTION_DAYS} days
          after they were archived (cleanup runs when you open the inbox).
        </p>
      ) : null}

      {status ? <p className={styles.meta}>{status}</p> : null}

      <div className={styles.inboxGrid}>
        <div className={styles.inboxCol}>
          <h3>Contact form</h3>
          {contacts.length === 0 ? (
            <p className={styles.meta}>{showArchived ? "No archived messages." : "No messages yet."}</p>
          ) : (
            contacts.map((c) => {
              const contactCopyKey = `contact-${c.id}`;
              const abs = formatAbsolute(c.created_at);
              const rel = formatRelativeTime(c.created_at);
              const preview = (c.message ?? "").trim().replace(/\s+/g, " ");
              const arch = c.archived_at;
              const archRel = arch ? formatRelativeTime(arch) : "";
              const archAbs = arch ? formatAbsolute(arch) : "";
              return (
                <div
                  key={c.id}
                  className={`${styles.inboxItem} ${c.read_flag ? styles.inboxItemRead : styles.inboxItemUnread}`}
                >
                  <details className={styles.inboxDetails}>
                    <summary className={styles.inboxSummary}>
                      <span className={styles.inboxSummaryMain}>
                        <strong>{displayText(c.full_name)}</strong>
                        {showArchived ? (
                          <span className={styles.inboxArchiveBadge}>Archived</span>
                        ) : (
                          <span
                            className={`${styles.readBadge} ${
                              c.read_flag ? styles.badgeReadLabel : styles.badgeUnreadLabel
                            }`}
                          >
                            {c.read_flag ? "Read" : "Unread"}
                          </span>
                        )}
                      </span>
                      <span className={styles.inboxSummaryMeta}>
                        <time dateTime={c.created_at} title={abs}>
                          {rel}
                        </time>
                        {showArchived && arch ? (
                          <>
                            <span className={styles.meta} aria-hidden>
                              ·
                            </span>
                            <span className={styles.meta} title={`Archived ${archAbs}`}>
                              Archived {archRel}
                            </span>
                          </>
                        ) : null}
                        <span className={styles.meta} title={c.email}>
                          {c.email}
                        </span>
                      </span>
                      {!showArchived && preview ? (
                        <p className={styles.inboxSummaryPreview}>{preview}</p>
                      ) : null}
                    </summary>
                    <div className={styles.inboxDetailBody}>
                      <p className={styles.meta}>
                        Submitted <time dateTime={c.created_at}>{abs}</time>
                      </p>
                      <ContactDetailBody
                        c={c}
                        contactCopyKey={contactCopyKey}
                        copiedKey={copiedKey}
                        onCopy={copyEmail}
                        onToggleRead={() => void patchContact(c.id, { readFlag: !c.read_flag })}
                        showArchivedView={showArchived}
                        onArchive={() => void patchContact(c.id, { archived: true })}
                        onUnarchive={() => void patchContact(c.id, { archived: false })}
                      />
                    </div>
                  </details>
                </div>
              );
            })
          )}
        </div>

        <div className={styles.inboxCol}>
          <h3>Model applications</h3>
          {applications.length === 0 ? (
            <p className={styles.meta}>{showArchived ? "No archived applications." : "No applications yet."}</p>
          ) : (
            applications.map((a) => {
              const st = normalizeAppStatus(a.status);
              const copyKey = `app-${a.id}`;
              const abs = formatAbsolute(a.created_at);
              const rel = formatRelativeTime(a.created_at);
              const arch = a.archived_at;
              const archRel = arch ? formatRelativeTime(arch) : "";
              const archAbs = arch ? formatAbsolute(arch) : "";
              return (
                <div key={a.id} className={styles.inboxItem}>
                  <details className={styles.inboxDetails}>
                    <summary className={styles.inboxSummary}>
                      <span className={styles.inboxSummaryMain}>
                        <strong>
                          {displayText(a.first_name)} {displayText(a.last_name)}
                        </strong>
                        {showArchived ? (
                          <span className={styles.inboxArchiveBadge}>Archived</span>
                        ) : (
                          <span className={st === "reviewed" ? styles.statusBadgeReviewed : styles.statusBadgeNew}>
                            {st === "reviewed" ? "Reviewed" : "New"}
                          </span>
                        )}
                      </span>
                      <span className={styles.inboxSummaryMeta}>
                        <time dateTime={a.created_at} title={abs}>
                          {rel}
                        </time>
                        {showArchived && arch ? (
                          <>
                            <span className={styles.meta} aria-hidden>
                              ·
                            </span>
                            <span className={styles.meta} title={`Archived ${archAbs}`}>
                              Archived {archRel}
                            </span>
                          </>
                        ) : null}
                        <span className={styles.meta} title={a.email}>
                          {a.email}
                        </span>
                      </span>
                    </summary>
                    <div className={styles.inboxDetailBody}>
                      <p className={styles.meta}>
                        Submitted <time dateTime={a.created_at}>{abs}</time>
                      </p>
                      <ApplicationDetailBody
                        a={a}
                        copyKey={copyKey}
                        copiedKey={copiedKey}
                        onCopy={copyEmail}
                        onToggleStatus={() => void patchApp(a.id, { status: st === "reviewed" ? "new" : "reviewed" })}
                        statusNorm={st}
                        showArchivedView={showArchived}
                        onArchive={() => void patchApp(a.id, { archived: true })}
                        onUnarchive={() => void patchApp(a.id, { archived: false })}
                      />
                    </div>
                  </details>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

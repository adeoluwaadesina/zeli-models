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
  gender_preference: string | null;
  model_count_total: number | null;
  model_count_female: number | null;
  model_count_male: number | null;
  terms_accepted: boolean;
  created_at: string;
  archived_at: string | null;
};

type AppRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  dob: string | null;
  applicant_age: number | null;
  applicant_address: string | null;
  gender: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  height_feet: number;
  height_inches: number;
  portfolio_link: string;
  interests: string[] | null;
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

function formatDateShort(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
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

function formatDob(isoOrStr: string | null | undefined): string {
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

function formatGenderPref(v: string | null | undefined): string {
  const m: Record<string, string> = {
    no_preference: "No preference",
    female: "Female",
    male: "Male",
    other: "Other / mixed"
  };
  const k = (v ?? "").trim();
  return m[k] ?? displayText(v);
}

function isBookingLead(c: ContactRow): boolean {
  return c.model_count_total != null && Number(c.model_count_total) >= 1;
}

function truncateCell(s: string, max = 56): string {
  const t = s.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function formatHeight(a: AppRow): string {
  const hf = a.height_feet;
  const hi = a.height_inches;
  if (
    hf != null &&
    hi != null &&
    !Number.isNaN(Number(hf)) &&
    !Number.isNaN(Number(hi))
  ) {
    return `${hf}'${hi}"`;
  }
  return "—";
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
  const booking = isBookingLead(c);
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
      {booking ? (
        <InboxSection title="Booking inquiry">
          <LabeledField label="Gender preference">{formatGenderPref(c.gender_preference)}</LabeledField>
          <LabeledField label="Models (total)">{c.model_count_total}</LabeledField>
          <LabeledField label="Female count">
            {c.model_count_female != null ? String(c.model_count_female) : "—"}
          </LabeledField>
          <LabeledField label="Male count">
            {c.model_count_male != null ? String(c.model_count_male) : "—"}
          </LabeledField>
          <LabeledField label="Terms accepted">{c.terms_accepted ? "Yes" : "No"}</LabeledField>
        </InboxSection>
      ) : null}
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
  const archivedAt = a.archived_at;
  const heightStr = formatHeight(a);
  const hasLegacyLocation =
    displayText(a.city) !== "—" ||
    displayText(a.state) !== "—" ||
    displayText(a.country) !== "—";

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
        <LabeledField label="Age">{a.applicant_age != null ? String(a.applicant_age) : "—"}</LabeledField>
        {a.dob ? <LabeledField label="Date of birth (legacy)">{formatDob(a.dob)}</LabeledField> : null}
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
      <InboxSection title="Address">
        <LabeledField label="Address">{displayText(a.applicant_address)}</LabeledField>
      </InboxSection>
      {hasLegacyLocation ? (
        <InboxSection title="Location (legacy)">
          <LabeledField label="City">{displayText(a.city)}</LabeledField>
          <LabeledField label="State / region">{displayText(a.state)}</LabeledField>
          <LabeledField label="Country">{displayText(a.country)}</LabeledField>
        </InboxSection>
      ) : null}
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
type InboxSource = "contacts" | "applications";

function normalizeRowArchivedAt(raw: unknown): string | null {
  if (raw == null || raw === "") return null;
  return String(raw);
}

function toNullableInt(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "number" && Number.isFinite(v)) return Math.trunc(v);
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number.parseInt(v, 10);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function normalizeContactRow(row: Record<string, unknown>): ContactRow {
  const r = row as Partial<ContactRow> & { id: string };
  return {
    id: r.id,
    full_name: String(r.full_name ?? ""),
    email: String(r.email ?? ""),
    phone: String(r.phone ?? ""),
    company: String(r.company ?? ""),
    message: String(r.message ?? ""),
    read_flag: Boolean(r.read_flag),
    gender_preference: r.gender_preference != null ? String(r.gender_preference) : null,
    model_count_total: toNullableInt(r.model_count_total),
    model_count_female: toNullableInt(r.model_count_female),
    model_count_male: toNullableInt(r.model_count_male),
    terms_accepted: Boolean(r.terms_accepted),
    created_at: String(r.created_at ?? ""),
    archived_at: normalizeRowArchivedAt(r.archived_at)
  };
}

function normalizeAppRow(row: Record<string, unknown>): AppRow {
  const r = row as Partial<AppRow> & { id: string };
  const interestsRaw = r.interests;
  const interests =
    Array.isArray(interestsRaw) ? interestsRaw.map(String) : null;
  return {
    id: r.id,
    first_name: String(r.first_name ?? ""),
    last_name: String(r.last_name ?? ""),
    email: String(r.email ?? ""),
    phone: String(r.phone ?? ""),
    dob: r.dob != null && String(r.dob).trim() !== "" ? String(r.dob) : null,
    applicant_age: toNullableInt(r.applicant_age),
    applicant_address:
      r.applicant_address != null ? String(r.applicant_address) : null,
    gender: r.gender != null ? String(r.gender) : null,
    country: r.country != null ? String(r.country) : null,
    state: r.state != null ? String(r.state) : null,
    city: r.city != null ? String(r.city) : null,
    height_feet: Number(r.height_feet ?? 0),
    height_inches: Number(r.height_inches ?? 0),
    portfolio_link: String(r.portfolio_link ?? ""),
    interests,
    interests_other: String(r.interests_other ?? ""),
    photo_urls: Array.isArray(r.photo_urls) ? (r.photo_urls as string[]) : [],
    status: String(r.status ?? ""),
    created_at: String(r.created_at ?? ""),
    archived_at: normalizeRowArchivedAt(r.archived_at)
  };
}

export function AdminInboxPanel() {
  const [inboxView, setInboxView] = React.useState<InboxView>("active");
  const [inboxSource, setInboxSource] = React.useState<InboxSource>("contacts");
  const [contacts, setContacts] = React.useState<ContactRow[]>([]);
  const [applications, setApplications] = React.useState<AppRow[]>([]);
  const [status, setStatus] = React.useState("");
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);
  const [openContactId, setOpenContactId] = React.useState<string | null>(null);
  const [openAppId, setOpenAppId] = React.useState<string | null>(null);

  const showArchived = inboxView === "archived";
  const showContacts = inboxSource === "contacts";

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
      const rawContacts = (data.contacts ?? []).map((row) => normalizeContactRow(row));
      const rawApps = (data.applications ?? []).map((row) => normalizeAppRow(row));

      if (showArchived) {
        setContacts(sortByArchivedAtDesc(rawContacts));
        setApplications(sortByArchivedAtDesc(rawApps));
      } else {
        setContacts(sortContactsUnreadFirst(rawContacts));
        setApplications(sortApplicationsNewFirst(rawApps));
      }
      setOpenContactId(null);
      setOpenAppId(null);
      setStatus("");
    } catch {
      setStatus("Network error loading inbox.");
    }
  }, [showArchived]);

  React.useEffect(() => {
    void load();
  }, [load]);

  React.useEffect(() => {
    setOpenContactId(null);
    setOpenAppId(null);
  }, [inboxView, inboxSource]);

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

  const contactColCount = showArchived ? 9 : 8;

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

      <div className={styles.inboxTabsStack}>
        <div className={styles.inboxViewTabs} role="tablist" aria-label="Active or archived">
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
        <div className={styles.inboxViewTabs} role="tablist" aria-label="Submission type">
          <button
            type="button"
            role="tab"
            aria-selected={showContacts}
            className={`${styles.inboxViewTab} ${showContacts ? styles.inboxViewTabActive : ""}`}
            onClick={() => setInboxSource("contacts")}
          >
            Contact form
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={!showContacts}
            className={`${styles.inboxViewTab} ${!showContacts ? styles.inboxViewTabActive : ""}`}
            onClick={() => setInboxSource("applications")}
          >
            Model applications
          </button>
        </div>
      </div>

      {showArchived ? (
        <p className={styles.inboxArchivePolicy}>
          Archived messages and applications are permanently deleted automatically {ARCHIVE_RETENTION_DAYS} days
          after they were archived (cleanup runs when you open the inbox).
        </p>
      ) : null}

      {status ? <p className={styles.meta}>{status}</p> : null}

      <div className={styles.inboxTablePanel}>
        {showContacts ? (
          <>
            <h3>Contact form</h3>
            {contacts.length === 0 ? (
              <p className={styles.meta}>{showArchived ? "No archived messages." : "No messages yet."}</p>
            ) : (
              <div className={styles.inboxTableScroll}>
                <table className={styles.inboxSheet}>
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Email</th>
                    <th scope="col">Phone</th>
                    <th scope="col">Date</th>
                    <th scope="col">Read</th>
                    <th scope="col">Booking</th>
                    <th scope="col">Preview</th>
                    {showArchived ? <th scope="col">Archived</th> : null}
                    <th scope="col"> </th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((c, i) => {
                    const contactCopyKey = `contact-${c.id}`;
                    const booking = isBookingLead(c);
                    const open = openContactId === c.id;
                    const preview = truncateCell(c.message ?? "");
                    const arch = c.archived_at;
                    const rowClass = `${styles.inboxSheetRow} ${i % 2 ? styles.inboxSheetRowAlt : ""} ${
                      showArchived ? "" : c.read_flag ? styles.inboxSheetRowRead : styles.inboxSheetRowUnread
                    }`;
                    return (
                      <React.Fragment key={c.id}>
                        <tr className={rowClass}>
                          <td>{displayText(c.full_name)}</td>
                          <td className={styles.inboxSheetMono}>{displayText(c.email)}</td>
                          <td className={styles.inboxSheetMono}>{displayText(c.phone)}</td>
                          <td>
                            <time dateTime={c.created_at} title={formatAbsolute(c.created_at)}>
                              {formatDateShort(c.created_at)}
                            </time>
                          </td>
                          <td>
                            {showArchived ? (
                              "—"
                            ) : (
                              <span
                                className={`${styles.readBadge} ${
                                  c.read_flag ? styles.badgeReadLabel : styles.badgeUnreadLabel
                                }`}
                              >
                                {c.read_flag ? "Read" : "Unread"}
                              </span>
                            )}
                          </td>
                          <td>{booking ? <span className={styles.inboxBookingTag}>Book</span> : "—"}</td>
                          <td className={styles.inboxSheetPreview}>{preview || "—"}</td>
                          {showArchived && arch ? (
                            <td>
                              <time dateTime={arch} title={formatAbsolute(arch)}>
                                {formatDateShort(arch)}
                              </time>
                            </td>
                          ) : showArchived ? (
                            <td>—</td>
                          ) : null}
                          <td className={styles.inboxSheetActions}>
                            <button
                              type="button"
                              className={`${styles.btn} ${styles.inboxSheetBtn}`}
                              onClick={() => setOpenContactId(open ? null : c.id)}
                            >
                              {open ? "Close" : "Details"}
                            </button>
                          </td>
                        </tr>
                        {open ? (
                          <tr className={styles.inboxSheetDetailRow}>
                            <td colSpan={contactColCount}>
                              <div className={styles.inboxSheetDetailInner}>
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
                            </td>
                          </tr>
                        ) : null}
                      </React.Fragment>
                    );
                  })}
                </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <>
            <h3>Model applications</h3>
            {applications.length === 0 ? (
              <p className={styles.meta}>{showArchived ? "No archived applications." : "No applications yet."}</p>
            ) : (
              <div className={styles.inboxTableScroll}>
                <table className={styles.inboxSheet}>
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Email</th>
                    <th scope="col">Age</th>
                    <th scope="col">Address</th>
                    <th scope="col">Height</th>
                    <th scope="col">Photos</th>
                    <th scope="col">Status</th>
                    <th scope="col">Submitted</th>
                    {showArchived ? <th scope="col">Archived</th> : null}
                    <th scope="col"> </th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((a, i) => {
                    const st = normalizeAppStatus(a.status);
                    const copyKey = `app-${a.id}`;
                    const open = openAppId === a.id;
                    const photos = a.photo_urls ?? [];
                    const arch = a.archived_at;
                    const appColSpan = showArchived ? 10 : 9;
                    return (
                      <React.Fragment key={a.id}>
                        <tr className={`${styles.inboxSheetRow} ${i % 2 ? styles.inboxSheetRowAlt : ""}`}>
                          <td>
                            {displayText(a.first_name)} {displayText(a.last_name)}
                          </td>
                          <td className={styles.inboxSheetMono}>{displayText(a.email)}</td>
                          <td>{a.applicant_age != null ? a.applicant_age : "—"}</td>
                          <td className={styles.inboxSheetPreview}>{truncateCell(a.applicant_address ?? "", 40)}</td>
                          <td>{formatHeight(a)}</td>
                          <td>{photos.length}</td>
                          <td>
                            {showArchived ? (
                              <span className={styles.inboxArchiveBadge}>Archived</span>
                            ) : (
                              <span className={st === "reviewed" ? styles.statusBadgeReviewed : styles.statusBadgeNew}>
                                {st === "reviewed" ? "Reviewed" : "New"}
                              </span>
                            )}
                          </td>
                          <td>
                            <time dateTime={a.created_at} title={formatAbsolute(a.created_at)}>
                              {formatDateShort(a.created_at)}
                            </time>
                          </td>
                          {showArchived && arch ? (
                            <td>
                              <time dateTime={arch} title={formatAbsolute(arch)}>
                                {formatDateShort(arch)}
                              </time>
                            </td>
                          ) : showArchived ? (
                            <td>—</td>
                          ) : null}
                          <td className={styles.inboxSheetActions}>
                            <button
                              type="button"
                              className={`${styles.btn} ${styles.inboxSheetBtn}`}
                              onClick={() => setOpenAppId(open ? null : a.id)}
                            >
                              {open ? "Close" : "Details"}
                            </button>
                          </td>
                        </tr>
                        {open ? (
                          <tr className={styles.inboxSheetDetailRow}>
                            <td colSpan={appColSpan}>
                              <div className={styles.inboxSheetDetailInner}>
                                <ApplicationDetailBody
                                  a={a}
                                  copyKey={copyKey}
                                  copiedKey={copiedKey}
                                  onCopy={copyEmail}
                                  onToggleStatus={() =>
                                    void patchApp(a.id, { status: st === "reviewed" ? "new" : "reviewed" })
                                  }
                                  statusNorm={st}
                                  showArchivedView={showArchived}
                                  onArchive={() => void patchApp(a.id, { archived: true })}
                                  onUnarchive={() => void patchApp(a.id, { archived: false })}
                                />
                              </div>
                            </td>
                          </tr>
                        ) : null}
                      </React.Fragment>
                    );
                  })}
                </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

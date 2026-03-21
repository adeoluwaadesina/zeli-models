"use client";

import type { OurValueItem, SiteSettings, WhatWeDoItem } from "@/data/siteSettings";
import * as React from "react";
import styles from "./page.module.css";

async function uploadOneSiteImage(file: File): Promise<string> {
  const res = await fetch("/api/admin/upload", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      scope: "site",
      folder: "what-we-do",
      files: [{ name: file.name, type: file.type }]
    })
  });
  const data = (await res.json()) as {
    error?: string;
    uploads?: { signedUrl: string; publicUrl: string; contentType: string }[];
  };
  if (!res.ok) throw new Error(data.error || "Upload init failed");
  const u = data.uploads?.[0];
  if (!u) throw new Error("No upload URL");
  const put = await fetch(u.signedUrl, {
    method: "PUT",
    headers: {
      "content-type": u.contentType || file.type || "image/jpeg",
      "x-upsert": "true"
    },
    body: file
  });
  if (!put.ok) throw new Error(`Upload failed (${put.status})`);
  return u.publicUrl;
}

export function AdminSitePanel() {
  const [settings, setSettings] = React.useState<SiteSettings | null>(null);
  const [marqueeText, setMarqueeText] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/site-settings", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { settings?: SiteSettings };
      if (data.settings) {
        setSettings(data.settings);
        setMarqueeText(data.settings.marqueeCategories.join("\n"));
      }
    } catch {
      // ignore
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    if (!settings) return;
    const marqueeCategories = marqueeText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const next: SiteSettings = { ...settings, marqueeCategories };
    setSaving(true);
    setStatus("Saving…");
    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ settings: next })
      });
      if (!res.ok) throw new Error("Save failed");
      setStatus("Saved");
      setSettings(next);
      window.setTimeout(() => setStatus(""), 1500);
    } catch {
      setStatus("Could not save");
    } finally {
      setSaving(false);
    }
  };

  if (!settings) {
    return <p className={styles.meta}>Loading site settings…</p>;
  }

  const updateWhatWeDo = (id: string, patch: Partial<WhatWeDoItem>) => {
    setSettings((s) => {
      if (!s) return s;
      return {
        ...s,
        whatWeDo: s.whatWeDo.map((w) => (w.id === id ? { ...w, ...patch } : w))
      };
    });
  };

  const addWhatWeDo = () => {
    setSettings((s) => {
      if (!s) return s;
      const n = s.whatWeDo.length;
      const item: WhatWeDoItem = {
        id: `wd-${crypto.randomUUID()}`,
        title: "New service",
        description: "",
        imageUrl: "",
        sortOrder: n
      };
      return { ...s, whatWeDo: [...s.whatWeDo, item] };
    });
  };

  const removeWhatWeDo = (id: string) => {
    setSettings((s) => (s ? { ...s, whatWeDo: s.whatWeDo.filter((w) => w.id !== id) } : s));
  };

  const updateValue = (id: string, patch: Partial<OurValueItem>) => {
    setSettings((s) => {
      if (!s) return s;
      return {
        ...s,
        ourValues: s.ourValues.map((v) => (v.id === id ? { ...v, ...patch } : v))
      };
    });
  };

  const addValue = () => {
    setSettings((s) => {
      if (!s) return s;
      const item: OurValueItem = {
        id: `v-${crypto.randomUUID()}`,
        title: "",
        text: ""
      };
      return { ...s, ourValues: [...s.ourValues, item] };
    });
  };

  const removeValue = (id: string) => {
    setSettings((s) => (s ? { ...s, ourValues: s.ourValues.filter((v) => v.id !== id) } : s));
  };

  return (
    <section className={styles.siteSection} aria-label="Site content">
      <div className={styles.siteHeader}>
        <h2 className={styles.modalTitle}>Site content</h2>
        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          type="button"
          disabled={saving}
          onClick={() => void save()}
        >
          Save site settings
        </button>
      </div>
      <p className={styles.meta} aria-live="polite">
        {status}
      </p>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="ig-url">
          Instagram URL (optional)
        </label>
        <input
          id="ig-url"
          className={styles.input}
          value={settings.instagramUrl}
          onChange={(e) => setSettings((s) => (s ? { ...s, instagramUrl: e.target.value } : s))}
          placeholder="https://instagram.com/…"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="marquee-lines">
          Marquee categories (one per line)
        </label>
        <textarea
          id="marquee-lines"
          className={styles.textarea}
          rows={6}
          value={marqueeText}
          onChange={(e) => setMarqueeText(e.target.value)}
        />
      </div>

      <h3 className={styles.siteSub}>What we do (carousel)</h3>
      <button className={styles.btn} type="button" onClick={addWhatWeDo}>
        Add service card
      </button>
      <div className={styles.wdList}>
        {[...settings.whatWeDo]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((w) => (
            <div key={w.id} className={styles.wdCard}>
              <button className={styles.btn} type="button" onClick={() => removeWhatWeDo(w.id)}>
                Remove
              </button>
              <div className={styles.fieldGrid}>
                <div className={styles.field}>
                  <label className={styles.label}>Title</label>
                  <input
                    className={styles.input}
                    value={w.title}
                    onChange={(e) => updateWhatWeDo(w.id, { title: e.target.value })}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Sort order</label>
                  <input
                    className={styles.input}
                    type="number"
                    value={w.sortOrder}
                    onChange={(e) =>
                      updateWhatWeDo(w.id, { sortOrder: Number(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Description</label>
                <textarea
                  className={styles.textarea}
                  rows={3}
                  value={w.description}
                  onChange={(e) => updateWhatWeDo(w.id, { description: e.target.value })}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Background image</label>
                {w.imageUrl ? (
                  <div className={styles.meta}>
                    <a href={w.imageUrl} target="_blank" rel="noreferrer">
                      Current image
                    </a>
                  </div>
                ) : null}
                <input
                  className={styles.input}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    void (async () => {
                      try {
                        setStatus("Uploading image…");
                        const url = await uploadOneSiteImage(f);
                        updateWhatWeDo(w.id, { imageUrl: url });
                        setStatus("Image uploaded");
                        window.setTimeout(() => setStatus(""), 1200);
                      } catch (err) {
                        setStatus(err instanceof Error ? err.message : "Upload failed");
                      }
                    })();
                  }}
                />
              </div>
            </div>
          ))}
      </div>

      <h3 className={styles.siteSub}>Our values</h3>
      <button className={styles.btn} type="button" onClick={addValue}>
        Add value
      </button>
      <div className={styles.wdList}>
        {settings.ourValues.map((v) => (
          <div key={v.id} className={styles.wdCard}>
            <button className={styles.btn} type="button" onClick={() => removeValue(v.id)}>
              Remove
            </button>
            <div className={styles.field}>
              <label className={styles.label}>Title</label>
              <input
                className={styles.input}
                value={v.title}
                onChange={(e) => updateValue(v.id, { title: e.target.value })}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Text</label>
              <textarea
                className={styles.textarea}
                rows={2}
                value={v.text}
                onChange={(e) => updateValue(v.id, { text: e.target.value })}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

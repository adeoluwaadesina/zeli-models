"use client";

import * as React from "react";
import type { ZeliModel } from "@/data/models";
import styles from "./page.module.css";

function move<T>(arr: T[], from: number, to: number) {
  const copy = [...arr];
  const item = copy.splice(from, 1)[0];
  copy.splice(to, 0, item);
  return copy;
}

export function AdminClient({ initial }: { initial: ZeliModel[] }) {
  const [models, setModels] = React.useState<ZeliModel[]>(initial);
  const [copied, setCopied] = React.useState(false);

  const exportJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(models, null, 2));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <>
      <div className={styles.toolbar}>
        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          type="button"
          onClick={exportJson}
        >
          {copied ? "Copied" : "Copy JSON (for later persistence)"}
        </button>
      </div>

      <div className={styles.card} role="list" aria-label="Models order list">
        {models.map((m, i) => (
          <div key={m.id} className={styles.row} role="listitem">
            <div>
              <div className={styles.name}>{m.name}</div>
              <div className={styles.meta}>
                {m.height} • {m.images.length} images
              </div>
            </div>
            <div className={styles.actions}>
              <button
                className={styles.btn}
                type="button"
                onClick={() => setModels((prev) => move(prev, i, Math.max(0, i - 1)))}
                disabled={i === 0}
                aria-label={`Move ${m.name} up`}
              >
                Up
              </button>
              <button
                className={styles.btn}
                type="button"
                onClick={() =>
                  setModels((prev) =>
                    move(prev, i, Math.min(prev.length - 1, i + 1))
                  )
                }
                disabled={i === models.length - 1}
                aria-label={`Move ${m.name} down`}
              >
                Down
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}


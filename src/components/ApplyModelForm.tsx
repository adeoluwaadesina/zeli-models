"use client";

import { digitsOnly, isValidPhoneDigits, PHONE_DIGITS_MAX } from "@/lib/formValidation";
import * as React from "react";
import styles from "./ApplyModelForm.module.css";

export function ApplyModelForm() {
  const [phone, setPhone] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "sending" | "ok" | "err">("idle");
  const [errMsg, setErrMsg] = React.useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValidPhoneDigits(phone)) {
      setStatus("err");
      setErrMsg("Enter a phone number with 10–15 digits (numbers only).");
      return;
    }
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("phone", phone);

    setStatus("sending");
    setErrMsg("");
    try {
      const res = await fetch("/api/apply", { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setStatus("err");
        setErrMsg(data.error || "Could not submit.");
        return;
      }
      setStatus("ok");
      form.reset();
      setPhone("");
    } catch {
      setStatus("err");
      setErrMsg("Network error.");
    }
  };

  return (
    <form className={styles.form} onSubmit={(e) => void onSubmit(e)}>
      <h2 className={styles.h2}>Your details</h2>
      <div className={styles.grid2}>
        <label className={styles.field}>
          <span className={styles.lab}>
            First name <span className={styles.req}>*</span>
          </span>
          <input className={styles.input} name="firstName" required placeholder="First name" />
        </label>
        <label className={styles.field}>
          <span className={styles.lab}>
            Surname <span className={styles.req}>*</span>
          </span>
          <input className={styles.input} name="lastName" required placeholder="Surname" />
        </label>
        <label className={styles.field}>
          <span className={styles.lab}>
            Email <span className={styles.req}>*</span>
          </span>
          <input
            className={styles.input}
            name="email"
            type="email"
            required
            placeholder="your.email@gmail.com"
          />
        </label>
        <label className={styles.field}>
          <span className={styles.lab}>
            Phone <span className={styles.req}>*</span>{" "}
            <span className={styles.hint}>(10–15 digits)</span>
          </span>
          <input
            className={styles.input}
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            required
            value={phone}
            onChange={(e) => setPhone(digitsOnly(e.target.value).slice(0, PHONE_DIGITS_MAX))}
            placeholder="2348012345678"
            maxLength={PHONE_DIGITS_MAX}
            aria-invalid={phone.length > 0 && !isValidPhoneDigits(phone)}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.lab}>
            Age <span className={styles.req}>*</span>
          </span>
          <input
            className={styles.input}
            name="age"
            type="number"
            required
            min={16}
            max={99}
            inputMode="numeric"
            placeholder="e.g. 22"
          />
        </label>
        <label className={styles.field}>
          <span className={styles.lab}>
            Height (ft) <span className={styles.req}>*</span>
          </span>
          <input
            className={styles.input}
            name="heightFt"
            type="number"
            required
            min={3}
            max={8}
            step={0.01}
            inputMode="decimal"
            placeholder="e.g. 5.75 (5′9″)"
          />
          <span className={styles.hint}>Decimal feet, e.g. 5.9 for 5′9″.</span>
        </label>
        <label className={`${styles.field} ${styles.full}`}>
          <span className={styles.lab}>
            Address <span className={styles.req}>*</span>
          </span>
          <input
            className={styles.input}
            name="applicantAddress"
            required
            placeholder="e.g. Victoria Island, Lagos"
          />
        </label>
      </div>

      <h2 className={styles.h2}>Photos</h2>
      <label className={`${styles.field} ${styles.full}`}>
        <span className={styles.lab}>
          Upload photos <span className={styles.req}>*</span>
        </span>
        <input className={styles.file} name="photos" type="file" accept="image/*" multiple required />
        <span className={styles.hint}>At least 1 image, up to 6, max 6MB each.</span>
      </label>

      {status === "ok" ? (
        <p className={styles.success} role="status">
          Application received. Our team will review and be in touch.
        </p>
      ) : null}
      {status === "err" ? (
        <p className={styles.error} role="alert">
          {errMsg}
        </p>
      ) : null}

      <button className={styles.submit} type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}

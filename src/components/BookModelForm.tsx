"use client";

import Link from "next/link";
import {
  CONTACT_MESSAGE_MAX_WORDS,
  countWords,
  digitsOnly,
  isValidPhoneDigits,
  isWithinWordLimit,
  PHONE_DIGITS_MAX
} from "@/lib/formValidation";
import * as React from "react";
import styles from "./BookModelForm.module.css";

const GENDER_PREF = [
  { value: "no_preference", label: "No preference" },
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "other", label: "Other / mixed" }
] as const;

export function BookModelForm() {
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [genderPreference, setGenderPreference] = React.useState("no_preference");
  const [modelCountTotal, setModelCountTotal] = React.useState("");
  const [termsAccepted, setTermsAccepted] = React.useState(false);
  const [status, setStatus] = React.useState<"idle" | "sending" | "ok" | "err">("idle");
  const [errMsg, setErrMsg] = React.useState("");

  const wordCount = countWords(message);

  const onPhoneChange = (raw: string) => {
    setPhone(digitsOnly(raw).slice(0, PHONE_DIGITS_MAX));
  };

  const parseCount = (s: string): number | null => {
    if (s.trim() === "") return null;
    const n = Number(s);
    if (!Number.isInteger(n) || n < 0 || n > 999) return null;
    return n;
  };

  const totalParsed = parseCount(modelCountTotal);

  const canSubmit =
    termsAccepted &&
    fullName.trim() &&
    email.trim() &&
    isValidPhoneDigits(phone) &&
    isWithinWordLimit(message, CONTACT_MESSAGE_MAX_WORDS) &&
    totalParsed !== null &&
    totalParsed >= 1;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrMsg("");
    if (!termsAccepted) {
      setStatus("err");
      setErrMsg("Please accept the terms and conditions.");
      return;
    }
    if (!isValidPhoneDigits(phone)) {
      setStatus("err");
      setErrMsg("Enter a phone number with 10–15 digits (numbers only).");
      return;
    }
    if (!isWithinWordLimit(message, CONTACT_MESSAGE_MAX_WORDS)) {
      setStatus("err");
      setErrMsg(`Message must be ${CONTACT_MESSAGE_MAX_WORDS} words or fewer.`);
      return;
    }
    if (totalParsed === null || totalParsed < 1) {
      setStatus("err");
      setErrMsg("Enter total number of models needed (whole number, at least 1).");
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          intent: "book",
          fullName,
          email,
          phone,
          company,
          message,
          genderPreference,
          modelCountTotal: totalParsed,
          termsAccepted: true
        })
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setStatus("err");
        setErrMsg(data.error || "Something went wrong.");
        return;
      }
      setStatus("ok");
      setFullName("");
      setEmail("");
      setPhone("");
      setCompany("");
      setMessage("");
      setGenderPreference("no_preference");
      setModelCountTotal("");
      setTermsAccepted(false);
    } catch {
      setStatus("err");
      setErrMsg("Network error.");
    }
  };

  return (
    <section className={styles.section} id="book-model-form" aria-labelledby="book-model-heading">
      <div className={styles.deco} aria-hidden="true" />
      <div className="container">
        <p className={styles.kicker}>Get In Touch</p>
        <h2 id="book-model-heading" className={styles.title}>
          Ready To <em>Elevate Your Next</em> Campaign?
        </h2>
        <p className={styles.sub}>
          Connect with our team to discuss casting, booking, and partnership opportunities.
        </p>

        <form className={styles.form} onSubmit={(e) => void onSubmit(e)}>
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="book-name">
                Full name *
              </label>
              <input
                id="book-name"
                className={styles.input}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
                placeholder="Your full name"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="book-email">
                Email *
              </label>
              <input
                id="book-email"
                className={styles.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="book-phone">
                Phone number * <span className={styles.hint}>(10–15 digits)</span>
              </label>
              <input
                id="book-phone"
                className={styles.input}
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                value={phone}
                onChange={(e) => onPhoneChange(e.target.value)}
                required
                placeholder="2348012345678"
                maxLength={15}
                aria-invalid={phone.length > 0 && !isValidPhoneDigits(phone)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="book-gender-pref">
                Gender preference
              </label>
              <select
                id="book-gender-pref"
                className={styles.input}
                value={genderPreference}
                onChange={(e) => setGenderPreference(e.target.value)}
              >
                {GENDER_PREF.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="book-company">
              Company / brand name
            </label>
            <input
              id="book-company"
              className={styles.input}
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              autoComplete="organization"
              placeholder="Brand or company"
            />
          </div>

          <div className={styles.countsBlock}>
            <p className={styles.countsLabel}>Models needed (whole numbers)</p>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="book-count-total">
                Total models *
              </label>
              <input
                id="book-count-total"
                className={styles.input}
                type="number"
                inputMode="numeric"
                min={1}
                max={999}
                step={1}
                value={modelCountTotal}
                onChange={(e) => setModelCountTotal(e.target.value.replace(/\D/g, "").slice(0, 3))}
                placeholder="e.g. 3"
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="book-msg">
              Tell us more *{" "}
              <span
                className={wordCount > CONTACT_MESSAGE_MAX_WORDS ? styles.wordCountBad : styles.wordCount}
              >
                {wordCount} / {CONTACT_MESSAGE_MAX_WORDS} words
              </span>
            </label>
            <textarea
              id="book-msg"
              className={styles.textarea}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={5}
              placeholder="Project details, dates, usage…"
            />
          </div>

          <label className={styles.termsRow}>
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            <span>
              I have read the{" "}
              <Link className={styles.termsLink} href="/terms" target="_blank" rel="noopener noreferrer">
                Terms and conditions
              </Link>
            </span>
          </label>

          {status === "ok" ? (
            <p className={styles.success} role="status">
              Thank you — we&apos;ll be in touch shortly.
            </p>
          ) : null}
          {status === "err" ? (
            <p className={styles.error} role="alert">
              {errMsg}
            </p>
          ) : null}

          <button className={styles.submit} type="submit" disabled={status === "sending" || !canSubmit}>
            {status === "sending" ? "Sending…" : "Submit"}
          </button>
        </form>
      </div>
    </section>
  );
}

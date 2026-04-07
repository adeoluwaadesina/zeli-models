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

const PROJECT_TYPES = [
  "",
  "Makeup Shoot",
  "Brand Campaign",
  "Commercial Campaigns",
  "Bridal Shoots",
  "Editorial Shoot",
  "Event Coverage",
  "Other"
] as const;

const BUDGET_RANGES = [
  "",
  "₦50,000 - ₦500,000",
  "₦500,000 - ₦2,000,000",
  "₦2,000,000 - ₦5,000,000",
  "₦5,000,000 - ₦10,000,000",
  "₦10,000,000+",
  "Discuss Budget"
] as const;

const USAGE_OPTIONS = ["", "Website", "Social media", "Billboard", "Other"] as const;

export function BookModelForm() {
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [projectType, setProjectType] = React.useState("");
  const [budgetRange, setBudgetRange] = React.useState("");
  const [projectDate, setProjectDate] = React.useState("");
  const [projectLocation, setProjectLocation] = React.useState("");
  const [projectDuration, setProjectDuration] = React.useState("");
  const [projectUsage, setProjectUsage] = React.useState("");
  const [genderPreference, setGenderPreference] = React.useState("no_preference");
  const [modelCountTotal, setModelCountTotal] = React.useState("");
  const [message, setMessage] = React.useState("");
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
    projectType.trim() &&
    budgetRange.trim() &&
    projectDate.trim() &&
    projectLocation.trim() &&
    projectUsage.trim() &&
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
    if (
      !projectType.trim() ||
      !budgetRange.trim() ||
      !projectDate.trim() ||
      !projectLocation.trim() ||
      !projectUsage.trim()
    ) {
      setStatus("err");
      setErrMsg("Please complete project type, budget, date, location, and usage.");
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
          termsAccepted: true,
          projectType: projectType.trim(),
          budgetRange: budgetRange.trim(),
          projectDate: projectDate.trim(),
          projectLocation: projectLocation.trim(),
          projectDuration: projectDuration.trim(),
          projectUsage: projectUsage.trim()
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
      setProjectType("");
      setBudgetRange("");
      setProjectDate("");
      setProjectLocation("");
      setProjectDuration("");
      setProjectUsage("");
      setGenderPreference("no_preference");
      setModelCountTotal("");
      setMessage("");
      setTermsAccepted(false);
    } catch {
      setStatus("err");
      setErrMsg("Network error.");
    }
  };

  return (
    <section
      className={styles.section}
      id="book-model-form"
      aria-labelledby="book-model-heading"
    >
      <div className={styles.deco} aria-hidden="true" />
      <div className="container">
        <form className={styles.form} onSubmit={(e) => void onSubmit(e)}>
          <div className={styles.formBlock}>
            <p className={styles.formBlockTitle}>Contact information</p>
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
                  Phone number * <span className={styles.hint}>(WhatsApp number preferably)</span>
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
                <label className={styles.label} htmlFor="book-company">
                  Company / brand
                </label>
                <input
                  id="book-company"
                  className={styles.input}
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  autoComplete="organization"
                  placeholder="Your company or brand name"
                />
              </div>
            </div>
          </div>

          <div className={styles.formBlock}>
            <p className={styles.formBlockTitle}>Project details</p>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="book-project-type">
                  Project type *
                </label>
                <select
                  id="book-project-type"
                  className={styles.input}
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  required
                >
                  <option value="">Select project type</option>
                  {PROJECT_TYPES.filter(Boolean).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="book-budget">
                  Budget range *
                </label>
                <select
                  id="book-budget"
                  className={styles.input}
                  value={budgetRange}
                  onChange={(e) => setBudgetRange(e.target.value)}
                  required
                >
                  <option value="">Select budget range</option>
                  {BUDGET_RANGES.filter(Boolean).map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="book-project-date">
                  Project date *
                </label>
                <input
                  id="book-project-date"
                  className={styles.input}
                  type="date"
                  value={projectDate}
                  onChange={(e) => setProjectDate(e.target.value)}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="book-location">
                  Location *
                </label>
                <input
                  id="book-location"
                  className={styles.input}
                  value={projectLocation}
                  onChange={(e) => setProjectLocation(e.target.value)}
                  required
                  placeholder="Lagos, Abuja, Port Harcourt…"
                />
              </div>
            </div>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="book-duration">
                  Duration
                </label>
                <input
                  id="book-duration"
                  className={styles.input}
                  value={projectDuration}
                  onChange={(e) => setProjectDuration(e.target.value)}
                  placeholder="Half day, full day, 2 days…"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="book-usage">
                  Usage *
                </label>
                <select
                  id="book-usage"
                  className={styles.input}
                  value={projectUsage}
                  onChange={(e) => setProjectUsage(e.target.value)}
                  required
                >
                  <option value="">Select usage</option>
                  {USAGE_OPTIONS.filter(Boolean).map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className={styles.fieldRow}>
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
          </div>

          <div className={styles.formBlock}>
            <p className={styles.formBlockTitle}>Project description</p>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="book-msg">
                Tell us about your project *{" "}
                <span
                  className={
                    wordCount > CONTACT_MESSAGE_MAX_WORDS ? styles.wordCountBad : styles.wordCount
                  }
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
                placeholder="Please describe your project in detail, including the creative concept, target audience, styling requirements, and any specific needs…"
              />
            </div>
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
              Thank you - we&apos;ll be in touch shortly.
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

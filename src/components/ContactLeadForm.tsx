"use client";

import {
  CONTACT_MESSAGE_MAX_WORDS,
  countWords,
  digitsOnly,
  isValidPhoneDigits,
  isWithinWordLimit,
  PHONE_DIGITS_MAX
} from "@/lib/formValidation";
import * as React from "react";
import styles from "./ContactLeadForm.module.css";

export function ContactLeadForm() {
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "sending" | "ok" | "err">("idle");
  const [errMsg, setErrMsg] = React.useState("");

  const wordCount = countWords(message);

  const onPhoneChange = (raw: string) => {
    setPhone(digitsOnly(raw).slice(0, PHONE_DIGITS_MAX));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrMsg("");
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
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ fullName, email, phone, company, message })
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
    } catch {
      setStatus("err");
      setErrMsg("Network error.");
    }
  };

  return (
    <section className={styles.section} id="contact" aria-labelledby="contact-heading">
      <div className={styles.deco} aria-hidden="true" />
      <div className="container">
        <p className={styles.kicker}>Get In Touch</p>
        <h2 id="contact-heading" className={styles.title}>
          Ready To <em>Elevate Your Next</em> Campaign?
        </h2>
        <p className={styles.sub}>
          Connect with our team to discuss casting, booking, and partnership opportunities.
        </p>

        <form className={styles.form} onSubmit={(e) => void onSubmit(e)}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="lead-name">
              Full name *
            </label>
            <input
              id="lead-name"
              className={styles.input}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoComplete="name"
              placeholder="Your full name"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="lead-email">
              Email *
            </label>
            <input
              id="lead-email"
              className={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="your@email.com"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="lead-phone">
              Phone number * <span className={styles.hint}>(10–15 digits)</span>
            </label>
            <input
              id="lead-phone"
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
            <label className={styles.label} htmlFor="lead-company">
              Company / brand name
            </label>
            <input
              id="lead-company"
              className={styles.input}
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              autoComplete="organization"
              placeholder="Brand or company"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="lead-msg">
              Tell us more *{" "}
              <span
                className={
                  wordCount > CONTACT_MESSAGE_MAX_WORDS ? styles.wordCountBad : styles.wordCount
                }
              >
                {wordCount} / {CONTACT_MESSAGE_MAX_WORDS} words
              </span>
            </label>
            <textarea
              id="lead-msg"
              className={styles.textarea}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={4}
              placeholder="Tell us about your project"
            />
          </div>

          {status === "ok" ? (
            <p className={styles.success} role="status">
              Thank you — we&apos;ll be in touch soon.
            </p>
          ) : null}
          {status === "err" ? (
            <p className={styles.error} role="alert">
              {errMsg}
            </p>
          ) : null}

          <button className={styles.submit} type="submit" disabled={status === "sending"}>
            {status === "sending" ? "Sending…" : "Send message"}
          </button>
        </form>
      </div>
    </section>
  );
}

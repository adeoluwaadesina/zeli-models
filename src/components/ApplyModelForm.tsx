"use client";

import { digitsOnly, isValidPhoneDigits, PHONE_DIGITS_MAX } from "@/lib/formValidation";
import { MODELING_INTEREST_OPTIONS } from "@/lib/modelingInterests";
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
      <h2 className={styles.h2}>Personal information</h2>
      <div className={styles.grid2}>
        <label className={styles.field}>
          <span className={styles.lab}>
            First name <span className={styles.req}>*</span>
          </span>
          <input className={styles.input} name="firstName" required placeholder="Your first name" />
        </label>
        <label className={styles.field}>
          <span className={styles.lab}>
            Last name <span className={styles.req}>*</span>
          </span>
          <input className={styles.input} name="lastName" required placeholder="Your last name" />
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
            Date of birth <span className={styles.req}>*</span>
          </span>
          <input className={styles.input} name="dob" type="date" required />
        </label>
        <label className={styles.field}>
          <span className={styles.lab}>
            Gender <span className={styles.req}>*</span>
          </span>
          <select className={styles.input} name="gender" required defaultValue="">
            <option value="" disabled>
              Select gender
            </option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other / prefer not to say</option>
          </select>
        </label>
      </div>

      <h2 className={styles.h2}>Location</h2>
      <div className={styles.grid2}>
        <label className={styles.field}>
          <span className={styles.lab}>
            Country <span className={styles.req}>*</span>
          </span>
          <input className={styles.input} name="country" required placeholder="Country" />
        </label>
        <label className={styles.field}>
          <span className={styles.lab}>
            State / region <span className={styles.req}>*</span>
          </span>
          <input className={styles.input} name="state" required placeholder="State" />
        </label>
        <label className={`${styles.field} ${styles.full}`}>
          <span className={styles.lab}>
            City <span className={styles.req}>*</span>
          </span>
          <input className={styles.input} name="city" required placeholder="City" />
        </label>
      </div>

      <h2 className={styles.h2}>Physical attributes</h2>
      <div className={styles.grid2}>
        <label className={styles.field}>
          <span className={styles.lab}>
            Height (feet) <span className={styles.req}>*</span>
          </span>
          <input
            className={styles.input}
            name="heightFeet"
            type="number"
            required
            min={3}
            max={8}
            inputMode="numeric"
            placeholder="e.g. 5"
          />
        </label>
        <label className={styles.field}>
          <span className={styles.lab}>
            Height (inches) <span className={styles.req}>*</span>
          </span>
          <input
            className={styles.input}
            name="heightInches"
            type="number"
            required
            min={0}
            max={11}
            inputMode="numeric"
            placeholder="e.g. 9"
          />
        </label>
      </div>

      <h2 className={styles.h2}>Portfolio &amp; interests</h2>
      <label className={`${styles.field} ${styles.full}`}>
        <span className={styles.lab}>Portfolio link</span>
        <input className={styles.input} name="portfolioLink" type="url" placeholder="https://…" />
      </label>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>
          Modeling interests <span className={styles.req}>*</span>
        </legend>
        <p className={styles.hint}>Select all that apply and/or describe in Other.</p>
        <div className={styles.checkGrid}>
          {MODELING_INTEREST_OPTIONS.map((opt) => (
            <label key={opt.key} className={styles.check}>
              <input type="checkbox" name={`interest_${opt.key}`} value="yes" />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
        <label className={styles.field}>
          <span className={styles.lab}>Other (please specify)</span>
          <input className={styles.input} name="interestsOther" placeholder="Other categories" />
        </label>
      </fieldset>

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

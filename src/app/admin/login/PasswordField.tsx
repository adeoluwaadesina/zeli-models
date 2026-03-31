"use client";

import * as React from "react";

export function PasswordField({
  inputClassName,
  wrapClassName,
  toggleClassName
}: {
  inputClassName: string;
  wrapClassName: string;
  toggleClassName: string;
}) {
  const [show, setShow] = React.useState(false);

  return (
    <div className={wrapClassName}>
      <input
        className={inputClassName}
        id="password"
        name="password"
        type={show ? "text" : "password"}
        autoComplete="current-password"
        required
        suppressHydrationWarning
      />
      <button
        className={toggleClassName}
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        suppressHydrationWarning
      >
        {show ? (
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 6c5.4 0 9.5 4.5 10.6 6-1.1 1.5-5.2 6-10.6 6S2.5 13.5 1.4 12C2.5 10.5 6.6 6 12 6Zm0 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0-2a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"
            />
            <path
              fill="currentColor"
              d="M3 3.7 20.3 21l-1.4 1.4L1.6 5.1 3 3.7Z"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 6c5.4 0 9.5 4.5 10.6 6-1.1 1.5-5.2 6-10.6 6S2.5 13.5 1.4 12C2.5 10.5 6.6 6 12 6Zm0 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0-2a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}


"use client";

import React, { useState } from "react";
import { AlertIcon, EyeIcon } from "./icons";

export function getPasswordStrength(p: string): {
  level: 0 | 1 | 2 | 3;
  label: string;
} {
  if (!p) return { level: 0, label: "" };
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/[0-9]/.test(p) || /[^A-Za-z0-9]/.test(p)) s++;
  const labels = ["", "Weak", "Fair", "Strong"] as const;
  return { level: s as 0 | 1 | 2 | 3, label: labels[s] };
}

export const strengthBar = {
  0: "var(--border-subtle)",
  1: "var(--status-error-text)",
  2: "var(--status-warning-text)",
  3: "var(--status-success-text)",
};

export const strengthText = {
  0: "var(--text-muted)",
  1: "var(--status-error-text)",
  2: "var(--status-warning-text)",
  3: "var(--status-success-text)",
};

export interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  error?: string;
  showStrength?: boolean;
  required?: boolean;
}

export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  error,
  showStrength,
  required,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const strength = getPasswordStrength(value);

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[12.5px] font-medium text-[var(--text-primary)]">
        {label}
        {required && (
          <span className="ml-0.5 text-[var(--brand-accent)]" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          required={required}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${id}-err` : showStrength && value ? `${id}-str` : undefined
          }
          className={[
            "w-full h-9 px-3 pr-9 text-[13.5px] text-[var(--text-primary)] bg-[var(--bg-input)] rounded-[7px] border transition-all duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)] focus-visible:ring-offset-0",
            error
              ? "border-[var(--status-error-border)] bg-[var(--status-error-bg)] focus-visible:ring-[var(--status-error-text)]"
              : "border-[var(--border-subtle)] hover:border-[var(--text-muted)]",
          ].join(" ")}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 flex items-center px-2.5 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)] rounded-r-[7px]"
        >
          <EyeIcon closed={visible} />
        </button>
      </div>

      {showStrength && value && !error && (
        <div id={`${id}-str`} aria-live="polite" className="mt-0.5">
          <div className="flex gap-1">
            {[1, 2, 3].map((bar) => (
              <div
                key={bar}
                className="h-[3px] flex-1 rounded-full transition-all duration-300"
                style={{
                  backgroundColor:
                    bar <= strength.level
                      ? strengthBar[strength.level]
                      : "var(--border-subtle)",
                }}
              />
            ))}
          </div>
          {strength.label && (
            <p
              className="text-[11px] font-medium mt-1"
              style={{ color: strengthText[strength.level] }}
            >
              {strength.label} password
            </p>
          )}
        </div>
      )}

      {error && (
        <p
          id={`${id}-err`}
          role="alert"
          className="flex items-center gap-1.5 text-[11.5px] font-medium text-[var(--status-error-text)]"
        >
          <AlertIcon />
          {error}
        </p>
      )}
    </div>
  );
}

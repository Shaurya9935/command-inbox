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
  0: "#E5E1D8",
  1: "#EF4444",
  2: "#F59E0B",
  3: "#245C4A",
};

export const strengthText = {
  0: "#77736D",
  1: "#DC2626",
  2: "#92400E",
  3: "#1B493A",
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
      <label htmlFor={id} className="text-[12.5px] font-medium text-[#242424]">
        {label}
        {required && (
          <span className="ml-0.5 text-[#245C4A]" aria-hidden="true">
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
            "w-full h-9 px-3 pr-9 text-[13.5px] text-[#242424] bg-white rounded-[7px] border transition-all duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#245C4A] focus-visible:ring-offset-0",
            error
              ? "border-[#FCA5A5] bg-[#FEF7F7] focus-visible:ring-[#EF4444]"
              : "border-[#E5E1D8] hover:border-[#C8C3BA]",
          ].join(" ")}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 flex items-center px-2.5 text-[#C4BFB8] hover:text-[#77736D] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#245C4A] rounded-r-[7px]"
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
                      : "#E5E1D8",
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
          className="flex items-center gap-1.5 text-[11.5px] font-medium text-[#B91C1C]"
        >
          <AlertIcon />
          {error}
        </p>
      )}
    </div>
  );
}

import React from "react";

export function CommandInboxIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="0.75"
        y="0.75"
        width="22.5"
        height="22.5"
        rx="6.25"
        fill="#245C4A"
      />
      <path
        d="M7 10l3.5 2.5L7 15"
        stroke="white"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="12.5"
        y="13"
        width="5"
        height="1.4"
        rx="0.7"
        fill="white"
        fillOpacity="0.85"
      />
      <path
        d="M7 19h10"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.4"
      />
    </svg>
  );
}

export function EyeIcon({ closed }: { closed: boolean }) {
  return closed ? (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 2l11 11M6.2 6.3a2 2 0 002.6 2.4M4 4.2C2.7 5.1 2 6.5 2 6.5s2.2 3.5 5.5 3.5c.9 0 1.7-.3 2.4-.6M7 3c3.3 0 5.5 3.5 5.5 3.5s-.5 1-1.5 1.9"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ) : (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 7.5S4.2 4 7.5 4 13 7.5 13 7.5s-2.2 3.5-5.5 3.5S2 7.5 2 7.5z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="7.5" cy="7.5" r="1.6" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function AlertIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M6 3.5v3"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <circle cx="6" cy="8.25" r="0.65" fill="currentColor" />
    </svg>
  );
}

export function GoogleIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M15.12 8.2c0-.53-.05-1.05-.13-1.54H8v2.9h4.07a3.48 3.48 0 01-1.51 2.29v1.9h2.44c1.43-1.32 2.26-3.26 2.26-5.55z"
        fill="#4285F4"
      />
      <path
        d="M8 15.5c2.04 0 3.75-.67 5-1.82l-2.44-1.9c-.67.45-1.54.72-2.56.72-1.97 0-3.64-1.33-4.23-3.12H1.25v1.96A7.5 7.5 0 008 15.5z"
        fill="#34A853"
      />
      <path
        d="M3.77 9.38A4.51 4.51 0 013.54 8c0-.47.08-.94.23-1.38V4.66H1.25A7.5 7.5 0 00.5 8c0 1.21.29 2.35.75 3.34l2.52-1.96z"
        fill="#FBBC05"
      />
      <path
        d="M8 3.5c1.12 0 2.12.38 2.9 1.13l2.17-2.17A7.5 7.5 0 008 .5a7.5 7.5 0 00-6.75 4.16l2.52 1.96C4.36 4.83 6.03 3.5 8 3.5z"
        fill="#EA4335"
      />
    </svg>
  );
}

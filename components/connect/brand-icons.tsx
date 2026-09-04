import React from "react";

export interface BrandIconProps {
  size?: number;
  className?: string;
}

export function GmailBrandIcon({ size = 32 }: BrandIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path
        d="M45 16.2v21.3c0 2.5-2 4.5-4.5 4.5H36V22.5L24 13.5 12 22.5V42H7.5C5 42 3 40 3 37.5V16.2c0-1.8 1-3.4 2.6-4.1l16-8.9c1.5-.8 3.3-.8 4.8 0l16 8.9c1.6.7 2.6 2.3 2.6 4.1z"
        fill="#EA4335"
      />
      <path
        d="M36 42h4.5c2.5 0 4.5-2 4.5-4.5V16.2c0-1.8-1-3.4-2.6-4.1l-6.4-3.6V42z"
        fill="#FBBC05"
      />
      <path
        d="M12 42V8.5L5.6 12.1C4 12.8 3 14.4 3 16.2v21.3C3 40 5 42 7.5 42H12z"
        fill="#4285F4"
      />
      <path
        d="M36 8.5L24 17.5 12 8.5 24 0l12 8.5z"
        fill="#34A853"
      />
      <path
        d="M36 22.5L24 31.5 12 22.5V42h24V22.5z"
        fill="#F2F2F2"
      />
      <path
        d="M12 22.5l12 9 12-9V42H12V22.5z"
        fill="#E0E0E0"
      />
      <path
        d="M24 17.5L36 8.5V22.5L24 31.5 12 22.5V8.5L24 17.5z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function GoogleCalendarBrandIcon({ size = 32 }: BrandIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="10" fill="#4285F4" />
      <rect x="8" y="14" width="32" height="26" rx="4" fill="#FFFFFF" />
      <rect x="8" y="14" width="32" height="7" rx="3" fill="#1A73E8" />
      <circle cx="15" cy="11" r="2.5" fill="#FFFFFF" />
      <circle cx="33" cy="11" r="2.5" fill="#FFFFFF" />
      <text
        x="24"
        y="33"
        textAnchor="middle"
        fontFamily="sans-serif"
        fontSize="14"
        fontWeight="bold"
        fill="#1A73E8"
      >
        31
      </text>
    </svg>
  );
}

export function OutlookBrandIcon({ size = 32 }: BrandIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="10" fill="#0078D4" />
      {/* Outlook document/envelope representation */}
      <path
        d="M26 12h12a2 2 0 012 2v20a2 2 0 01-2 2H26V12z"
        fill="#28A8EA"
      />
      <path
        d="M26 12L38 22l-12 7V12z"
        fill="#50D9FF"
        opacity="0.8"
      />
      <rect
        x="8"
        y="13"
        width="20"
        height="22"
        rx="3"
        fill="#005A9E"
      />
      <circle
        cx="18"
        cy="24"
        r="6.5"
        stroke="#FFFFFF"
        strokeWidth="3.2"
        fill="none"
      />
    </svg>
  );
}

export function SlackBrandIcon({ size = 32 }: BrandIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="10" fill="#FFFFFF" stroke="#EDE8DF" strokeWidth="1.5" />
      <g transform="translate(6, 6) scale(0.75)">
        {/* Top left yellow */}
        <path
          d="M19.75 14a4.25 4.25 0 00-4.25-4.25H11.25v4.25a4.25 4.25 0 008.5 0z"
          fill="#ECB22E"
        />
        <path
          d="M11.25 18.25a4.25 4.25 0 004.25 4.25h10.6a4.25 4.25 0 000-8.5H15.5a4.25 4.25 0 00-4.25 4.25z"
          fill="#ECB22E"
        />
        {/* Top right green */}
        <path
          d="M34 19.75a4.25 4.25 0 004.25-4.25V11.25h-4.25a4.25 4.25 0 000 8.5z"
          fill="#2EB67D"
        />
        <path
          d="M29.75 11.25a4.25 4.25 0 00-4.25 4.25v10.6a4.25 4.25 0 008.5 0V15.5a4.25 4.25 0 00-4.25-4.25z"
          fill="#2EB67D"
        />
        {/* Bottom right red */}
        <path
          d="M28.25 34a4.25 4.25 0 004.25 4.25h4.25V34a4.25 4.25 0 00-8.5 0z"
          fill="#E01E5A"
        />
        <path
          d="M36.75 29.75a4.25 4.25 0 00-4.25-4.25H21.9a4.25 4.25 0 000 8.5h10.6a4.25 4.25 0 004.25-4.25z"
          fill="#E01E5A"
        />
        {/* Bottom left blue */}
        <path
          d="M14 28.25a4.25 4.25 0 00-4.25 4.25v4.25H14a4.25 4.25 0 000-8.5z"
          fill="#36C5F0"
        />
        <path
          d="M18.25 36.75a4.25 4.25 0 004.25-4.25V21.9a4.25 4.25 0 00-8.5 0v10.6a4.25 4.25 0 004.25 4.25z"
          fill="#36C5F0"
        />
      </g>
    </svg>
  );
}

export function NotionBrandIcon({ size = 32 }: BrandIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="10" fill="#18181B" />
      <path
        d="M13.2 12.8c1.1.2 2 .4 2.8.5.5.1.7.4.7.9v20.4c0 .7-.4 1.1-1.1 1.1-.9 0-1.8-.2-2.7-.4-.4-.1-.6-.3-.6-.7V13.8c0-.6.4-.9.9-1zm4.7 1.2c.8-.3 1.9-.6 3.1-.6 1.4 0 2.2.5 2.8 1.4l10.8 16.5V14.5c0-.6.4-1 1-1h2.2c.6 0 1 .4 1 1v20c0 .8-.5 1.3-1.3 1.3-.9 0-2-.4-3.1-.8l-12.8-19v18.7c0 .6-.4 1-1 1h-1.7c-.6 0-1-.4-1-1V14.9c0-.6.4-1 1-1h0z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function ZoomBrandIcon({ size = 32 }: BrandIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="10" fill="#2D8CFF" />
      <path
        d="M13 18.5a3.5 3.5 0 013.5-3.5h10a3.5 3.5 0 013.5 3.5v11a3.5 3.5 0 01-3.5 3.5h-10A3.5 3.5 0 0113 29.5v-11z"
        fill="#FFFFFF"
      />
      <path
        d="M30 21.5l5-3.5v12l-5-3.5v-5z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function LinearBrandIcon({ size = 32 }: BrandIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="10" fill="#5E6AD2" />
      <path
        d="M14.5 33.5L33.5 14.5M14.5 24L24 14.5M24 33.5l9.5-9.5"
        stroke="#FFFFFF"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function GitHubBrandIcon({ size = 32 }: BrandIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="10" fill="#24292F" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M24 11C16.82 11 11 16.82 11 24c0 5.75 3.73 10.62 8.9 12.33.65.12.89-.28.89-.62v-2.18c-3.62.79-4.38-1.74-4.38-1.74-.53-1.35-1.3-1.71-1.3-1.71-1.18-.8.09-.79.09-.79 1.3.09 1.99 1.34 1.99 1.34 1.16 1.98 3.04 1.41 3.78 1.08.12-.84.45-1.41.82-1.74-2.89-.33-5.93-1.44-5.93-6.43 0-1.42.51-2.58 1.34-3.49-.13-.33-.58-1.65.13-3.44 0 0 1.09-.35 3.58 1.33 1.04-.29 2.15-.43 3.26-.44 1.1.01 2.22.15 3.26.44 2.49-1.68 3.57-1.33 3.57-1.33.72 1.79.27 3.11.14 3.44.84.91 1.34 2.07 1.34 3.49 0 5-3.05 6.09-5.95 6.42.47.4.88 1.2.88 2.42v3.58c0 .35.24.75.9.62C33.28 34.61 37 29.74 37 24c0-7.18-5.82-13-13-13z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

"use client";

import React from "react";
import { useTheme, Theme } from "./theme-provider";

export function SunIcon({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

export function MoonIcon({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function MonitorIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

/**
 * Quick toggle button for the top bar (toggles between Light and Dark)
 */
export function ThemeToggleButton() {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        border: "1px solid var(--border-hairline)",
        background: "transparent",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-secondary)",
        transition: "background 0.12s, color 0.12s, border-color 0.12s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--hover)";
        e.currentTarget.style.color = "var(--text-primary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "var(--text-secondary)";
      }}
    >
      {resolvedTheme === "dark" ? <SunIcon size={14} /> : <MoonIcon size={14} />}
    </button>
  );
}

/**
 * Segmented control with 3 options: Light, Dark, System
 */
export function ThemeSegmentedControl() {
  const { theme, setTheme } = useTheme();

  const options: { id: Theme; label: string; icon: React.ReactNode }[] = [
    { id: "light", label: "Light", icon: <SunIcon size={13} /> },
    { id: "dark", label: "Dark", icon: <MoonIcon size={13} /> },
    { id: "system", label: "System", icon: <MonitorIcon size={13} /> },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Theme selection"
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: "var(--surface-raised)",
        border: "1px solid var(--border-hairline)",
        borderRadius: 9,
        padding: 3,
        gap: 2,
      }}
    >
      {options.map((opt) => {
        const isSelected = theme === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => setTheme(opt.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 12px",
              fontSize: 12,
              fontWeight: isSelected ? 600 : 500,
              fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
              color: isSelected ? "var(--text-primary)" : "var(--text-muted)",
              background: isSelected ? "var(--surface-card)" : "transparent",
              border: isSelected ? "1px solid var(--border-hairline)" : "1px solid transparent",
              borderRadius: 7,
              cursor: "pointer",
              boxShadow: isSelected ? "0 1px 3px var(--shadow-color)" : "none",
              transition: "all 0.15s ease",
            }}
          >
            {opt.icon}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

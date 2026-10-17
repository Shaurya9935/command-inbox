"use client";

import React from "react";
import { CalViewType } from "./types";

export interface CalendarHeaderProps {
  calView: CalViewType;
  onViewChange: (view: CalViewType) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onNewEvent: () => void;
  periodTitle?: string;
}

export function CalendarHeader({
  calView,
  onViewChange,
  onPrev,
  onNext,
  onToday,
  onNewEvent,
  periodTitle,
}: CalendarHeaderProps) {
  const displayTitle =
    periodTitle ||
    (calView === "week"
      ? "Aug 31 – Sep 6, 2026"
      : calView === "day"
      ? "Thursday, Sep 3"
      : "September 2026");

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 20px",
        borderBottom: "1px solid var(--border-hairline)",
        background: "var(--surface-card)",
        flexShrink: 0,
      }}
    >
      {/* Prev / Next buttons */}
      <button
        type="button"
        onClick={onPrev}
        aria-label="Previous period"
        style={{
          width: 28,
          height: 28,
          borderRadius: 7,
          border: "1px solid var(--border-hairline)",
          background: "transparent",
          cursor: "pointer",
          fontSize: 16,
          color: "var(--text-secondary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.12s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hover)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        ‹
      </button>

      <button
        type="button"
        onClick={onNext}
        aria-label="Next period"
        style={{
          width: 28,
          height: 28,
          borderRadius: 7,
          border: "1px solid var(--border-hairline)",
          background: "transparent",
          cursor: "pointer",
          fontSize: 16,
          color: "var(--text-secondary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.12s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hover)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        ›
      </button>

      {/* Period title */}
      <span
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "var(--text-primary)",
          letterSpacing: "-0.025em",
          minWidth: 180,
          fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
        }}
      >
        {displayTitle}
      </span>

      {/* Today button */}
      <button
        type="button"
        onClick={onToday}
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: "var(--accent-text)",
          background: "var(--accent-tint)",
          border: "1px solid var(--accent-border)",
          borderRadius: 7,
          padding: "4px 11px",
          cursor: "pointer",
          fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
          transition: "background 0.12s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-tint-hover)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent-tint)")}
      >
        Today
      </button>

      <div style={{ flex: 1 }} />

      {/* View switcher */}
      <div
        style={{
          display: "flex",
          gap: 1,
          background: "var(--surface-raised)",
          borderRadius: 8,
          padding: 3,
        }}
      >
        {(["week", "month", "day", "agenda"] as CalViewType[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onViewChange(v)}
            style={{
              fontSize: 12,
              fontWeight: 500,
              fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
              color: calView === v ? "var(--accent-text)" : "var(--text-secondary)",
              background: calView === v ? "var(--surface-card)" : "transparent",
              border: "none",
              borderRadius: 5,
              padding: "4px 11px",
              cursor: "pointer",
              boxShadow: calView === v ? "0 1px 3px var(--shadow-color)" : "none",
              transition: "all 0.12s",
              textTransform: "capitalize",
            }}
          >
            {v}
          </button>
        ))}
      </div>

      {/* + New event */}
      <button
        type="button"
        onClick={onNewEvent}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          fontSize: 12.5,
          fontWeight: 500,
          color: "var(--on-accent)",
          background: "var(--accent-solid)",
          border: "none",
          borderRadius: 8,
          padding: "7px 14px",
          cursor: "pointer",
          fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
          transition: "opacity 0.12s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        <span style={{ fontSize: 17, lineHeight: 1, marginTop: -1 }}>+</span> New event
      </button>
    </div>
  );
}

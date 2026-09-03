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
        borderBottom: "1px solid #EDEAE4",
        background: "#FDFCF8",
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
          border: "1px solid #E4E0D8",
          background: "transparent",
          cursor: "pointer",
          fontSize: 16,
          color: "#7B7775",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.12s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#F0EDE7")}
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
          border: "1px solid #E4E0D8",
          background: "transparent",
          cursor: "pointer",
          fontSize: 16,
          color: "#7B7775",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.12s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#F0EDE7")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        ›
      </button>

      {/* Period title */}
      <span
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "#1A1917",
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
          color: "#5549C0",
          background: "#EAE8F8",
          border: "1px solid #D4D0F0",
          borderRadius: 7,
          padding: "4px 11px",
          cursor: "pointer",
          fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
          transition: "background 0.12s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#DDD9F5")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#EAE8F8")}
      >
        Today
      </button>

      <div style={{ flex: 1 }} />

      {/* View switcher */}
      <div
        style={{
          display: "flex",
          gap: 1,
          background: "#F0EDE7",
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
              color: calView === v ? "#5549C0" : "#7B7775",
              background: calView === v ? "#FFFFFF" : "transparent",
              border: "none",
              borderRadius: 5,
              padding: "4px 11px",
              cursor: "pointer",
              boxShadow: calView === v ? "0 1px 3px rgba(0,0,0,0.07)" : "none",
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
          color: "#FFF",
          background: "#5549C0",
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

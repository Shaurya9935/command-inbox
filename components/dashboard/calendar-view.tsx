"use client";

import React from "react";
import { CalendarEvent } from "./types";
import { BackIcon } from "./icons";
import { EVENTS, EVENT_COLORS } from "./mock-data";

export interface CalendarViewProps {
  events?: CalendarEvent[];
  onBack: () => void;
  onSelectEvent?: (event: CalendarEvent) => void;
}

export function CalendarView({
  events = EVENTS,
  onBack,
  onSelectEvent,
}: CalendarViewProps) {
  return (
    <div
      style={{
        flex: 1,
        padding: "36px 48px",
        overflowY: "auto",
        animation: "fadeSlideIn 0.2s ease",
      }}
    >
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12.5,
          color: "#9B9691",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          marginBottom: 28,
          fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
          transition: "color 0.12s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#5549C0")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#9B9691")}
      >
        <BackIcon />
        <span>Back to workspace</span>
      </button>

      {/* Header */}
      <h2
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: "#1A1917",
          letterSpacing: "-0.03em",
          margin: "0 0 6px",
          fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
        }}
      >
        Today&apos;s schedule
      </h2>
      <div
        style={{
          fontSize: 12.5,
          color: "#9B9691",
          fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
          marginBottom: 32,
        }}
      >
        {new Date().toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      </div>

      {/* Events List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {events.map((ev, i) => {
          const c = EVENT_COLORS[ev.type];
          return (
            <div
              key={i}
              onClick={() => onSelectEvent && onSelectEvent(ev)}
              style={{
                display: "flex",
                gap: 20,
                padding: "14px 20px",
                borderRadius: 10,
                background: ev.isNext ? c.bg : "transparent",
                border: ev.isNext
                  ? `1px solid ${c.line}30`
                  : "1px solid transparent",
                transition: "background 0.15s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                if (!ev.isNext) {
                  (e.currentTarget as HTMLDivElement).style.background =
                    "#F5F2EC";
                }
              }}
              onMouseLeave={(e) => {
                if (!ev.isNext) {
                  (e.currentTarget as HTMLDivElement).style.background =
                    "transparent";
                }
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                  color: ev.isNext ? c.text : "#9B9691",
                  fontWeight: ev.isNext ? 500 : 400,
                  width: 38,
                  flexShrink: 0,
                  paddingTop: 2,
                }}
              >
                {ev.time}
              </span>
              <div
                style={{
                  width: 3,
                  borderRadius: 4,
                  background: ev.isNext ? c.line : "#E4E0D8",
                  flexShrink: 0,
                  alignSelf: "stretch",
                }}
              />
              <div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: ev.isNext ? 600 : 400,
                    color: ev.isNext ? c.text : "#1A1917",
                    fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
                  }}
                >
                  {ev.label}
                </div>
                {ev.detail && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "#9B9691",
                      fontFamily: "var(--font-body, 'Inter', system-ui, sans-serif)",
                      marginTop: 2,
                    }}
                  >
                    {ev.detail}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

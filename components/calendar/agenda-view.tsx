"use client";

import React from "react";
import { CalEvent, fmtTime, WeekDay } from "./types";
import { EV_S } from "./constants";

export interface AgendaViewProps {
  events: CalEvent[];
  selectedEventId?: number | string | null;
  onSelectEvent: (event: CalEvent) => void;
  weekDays?: WeekDay[];
}

export function AgendaView({
  events,
  selectedEventId,
  onSelectEvent,
  weekDays = [],
}: AgendaViewProps) {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
      {weekDays.map((day, di) => {
        const dayEvs = events.filter((e) => e.day === di);
        if (dayEvs.length === 0) return null;

        return (
          <div key={di} style={{ marginBottom: 28 }}>
            {/* Day label banner */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: day.isToday ? "#5549C0" : "#6B6762",
                  letterSpacing: "-0.01em",
                  fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
                }}
              >
                {day.label} {day.monthStr} {day.dateNum}
              </div>

              {day.isToday && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: "#5549C0",
                    background: "#EAE8F8",
                    padding: "2px 7px",
                    borderRadius: 20,
                    letterSpacing: "0.04em",
                    fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
                  }}
                >
                  TODAY
                </span>
              )}

              <div style={{ flex: 1, height: 1, background: "#EDEAE4" }} />
            </div>

            {/* List of events on this day */}
            {dayEvs.map((ev) => {
              const s = EV_S[ev.type] || EV_S.meeting;
              const isSel = selectedEventId === ev.id;

              return (
                <div
                  key={ev.id}
                  onClick={() => onSelectEvent(ev)}
                  style={{
                    display: "flex",
                    gap: 14,
                    padding: "12px 16px",
                    borderRadius: 10,
                    marginBottom: 6,
                    cursor: "pointer",
                    background: isSel ? s.bg : "transparent",
                    border: `1px solid ${isSel ? s.border : "transparent"}`,
                    transition: "background 0.12s, border-color 0.12s",
                    fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSel) (e.currentTarget as HTMLDivElement).style.background = "#F5F2EC";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSel) (e.currentTarget as HTMLDivElement).style.background = "transparent";
                  }}
                >
                  {/* Left colored bar */}
                  <div
                    style={{
                      width: 3.5,
                      borderRadius: 4,
                      background: s.bar,
                      flexShrink: 0,
                      alignSelf: "stretch",
                    }}
                  />

                  {/* Time column */}
                  <div style={{ width: 88, flexShrink: 0 }}>
                    <div
                      style={{
                        fontSize: 11.5,
                        fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                        color: "#9B9691",
                      }}
                    >
                      {fmtTime(ev.startH)}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                        color: "#C5C0B8",
                      }}
                    >
                      {fmtTime(ev.endH)}
                    </div>
                  </div>

                  {/* Content column */}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: 13.5,
                        fontWeight: 600,
                        color: "#1A1917",
                        marginBottom: 2,
                      }}
                    >
                      {ev.title}
                    </div>
                    {ev.location && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "#9B9691",
                          fontFamily: "var(--font-body, 'Inter', system-ui, sans-serif)",
                        }}
                      >
                        {ev.location}
                      </div>
                    )}
                    {ev.attendees && ev.attendees.length > 0 && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "#9B9691",
                          fontFamily: "var(--font-body, 'Inter', system-ui, sans-serif)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {ev.attendees.join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

"use client";

import React from "react";
import { useCurrentTime } from "@/hooks/use-current-time";
import { CalendarEvent } from "./types";
import { EVENT_COLORS } from "./mock-data";
import { CalendarIcon } from "./icons";
import { useCalendarEvents } from "@/hooks/use-calendar";

export interface RightPanelProps {
  events?: CalendarEvent[];
  onOpenCalendar: () => void;
  onOpenNextEvent?: (event: CalendarEvent) => void;
  isCalendarConnected?: boolean;
  onConnectCalendar?: () => void;
}

export function RightPanel({
  events: propEvents,
  onOpenCalendar,
  onOpenNextEvent,
  isCalendarConnected: propIsConnected,
  onConnectCalendar,
}: RightPanelProps) {
  const { todayEvents, isLoading, rawEvents, isNotConnected: hookNotConnected } = useCalendarEvents();
  const isNotConnected = propIsConnected !== undefined ? !propIsConnected : hookNotConnected;

  // Prefer caller-provided events if they are custom, otherwise use live todayEvents
  const events = propEvents !== undefined ? propEvents : todayEvents;

  // The next upcoming event
  const nextEvent = events.find((e) => e.isNext) || events[0];

  // Dynamic formatted date for Today
  const todayDateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const currentMs = useCurrentTime();

  // Calculate relative time string for nextEvent
  const getRelativeTime = (ev: CalendarEvent): string => {
    if (ev.time === "All day") return "All day event";
    if (!ev.startIso) return "Today";

    const eventMs = new Date(ev.startIso).getTime();
    const effectiveNowMs = currentMs ?? eventMs;
    const diffMin = Math.round((eventMs - effectiveNowMs) / 60000);

    if (diffMin < 0 && diffMin > -60) {
      return `Started ${Math.abs(diffMin)}m ago`;
    } else if (diffMin <= 0) {
      return "Earlier today";
    } else if (diffMin < 60) {
      return `In ${diffMin} minute${diffMin === 1 ? "" : "s"}`;
    } else {
      const hours = Math.floor(diffMin / 60);
      const mins = diffMin % 60;
      if (mins === 0) return `In ${hours} hour${hours === 1 ? "" : "s"}`;
      return `In ${hours}h ${mins}m`;
    }
  };

  return (
    <div
      style={{
        width: 252,
        flexShrink: 0,
        borderLeft: "1px solid var(--border-hairline)",
        background: "var(--bg-panel)",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}
    >
      {/* Header */}
      <div style={{ padding: "24px 20px 16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: 13.5,
              fontWeight: 600,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
              fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
            }}
          >
            Today
          </span>
          <button
            type="button"
            onClick={onOpenCalendar}
            style={{
              fontSize: 11.5,
              color: "var(--text-muted)",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
              padding: 0,
              transition: "color 0.12s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-text)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            Open →
          </button>
        </div>
        <div
          style={{
            fontSize: 11.5,
            color: "var(--text-muted)",
            fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
            marginTop: 2,
          }}
        >
          {todayDateStr}
        </div>
      </div>

      {/* If not connected */}
      {isNotConnected ? (
        <div
          style={{
            padding: "36px 20px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            flex: 1,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 11,
              background: "var(--surface-raised)",
              border: "1px solid var(--border-hairline)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--accent-solid)",
            }}
          >
            <CalendarIcon size={20} />
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-primary)",
              fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
            }}
          >
            Calendar not connected
          </div>
          <div
            style={{
              fontSize: 11.5,
              color: "var(--text-muted)",
              lineHeight: 1.45,
              fontFamily: "var(--font-body, 'Inter', system-ui, sans-serif)",
              maxWidth: 190,
            }}
          >
            Connect Google Calendar to view today&apos;s meetings and schedule.
          </div>
          <button
            type="button"
            onClick={onConnectCalendar || onOpenCalendar}
            style={{
              marginTop: 4,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: 8,
              background: "var(--accent-solid)",
              color: "var(--on-accent)",
              fontSize: 11.5,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
              boxShadow: "0 1px 3px var(--shadow-color)",
              transition: "background 0.15s, transform 0.1s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--accent-hover)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--accent-solid)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Connect Calendar →
          </button>
        </div>
      ) : isLoading && rawEvents.length === 0 && events.length === 0 ? (
        <div
          style={{
            padding: "24px 20px",
            fontSize: 12,
            color: "var(--text-muted)",
            textAlign: "center",
            fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
          }}
        >
          Loading today&apos;s events…
        </div>
      ) : events.length === 0 ? (
        /* Empty state when no events today */
        <div
          style={{
            padding: "36px 20px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            flex: 1,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "var(--hover)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted)",
            }}
          >
            <CalendarIcon size={18} />
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-primary)",
              fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
            }}
          >
            No events today
          </div>
          <div
            style={{
              fontSize: 11.5,
              color: "var(--text-muted)",
              lineHeight: 1.4,
              fontFamily: "var(--font-body, 'Inter', system-ui, sans-serif)",
            }}
          >
            Your schedule is clear for the day.
          </div>
        </div>
      ) : (
        <>
          {/* Next up card */}
          {nextEvent && (
            <div style={{ padding: "0 16px 20px" }}>
              <div
                style={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 11,
                  background: "var(--next-up-bg)",
                  border: "1px solid var(--next-up-border)",
                  padding: "16px 18px",
                }}
              >
                {/* Ambient blob */}
                <div
                  style={{
                    position: "absolute",
                    top: -24,
                    right: -24,
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: "var(--accent-tint)",
                    pointerEvents: "none",
                  }}
                />

                <div
                  style={{
                    fontSize: 9.5,
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    color: "var(--accent-text)",
                    textTransform: "uppercase",
                    marginBottom: 10,
                    fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
                  }}
                >
                  Next up
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    letterSpacing: "-0.045em",
                    fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
                    lineHeight: 1,
                  }}
                >
                  {nextEvent.time}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    margin: "5px 0 2px",
                    fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
                  }}
                >
                  {nextEvent.label}
                </div>
                {nextEvent.detail && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--accent-text)",
                      fontFamily: "var(--font-body, 'Inter', system-ui, sans-serif)",
                      marginBottom: 2,
                    }}
                  >
                    {nextEvent.detail}
                  </div>
                )}
                <div
                  style={{
                    fontSize: 11.5,
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-body, 'Inter', system-ui, sans-serif)",
                    marginBottom: 14,
                  }}
                >
                  {getRelativeTime(nextEvent)}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenNextEvent) onOpenNextEvent(nextEvent);
                    else onOpenCalendar();
                  }}
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: "var(--accent-text)",
                    background: "var(--surface-card)",
                    border: "1px solid var(--border-hairline)",
                    borderRadius: 7,
                    padding: "5px 12px",
                    cursor: "pointer",
                    fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "var(--surface-card)")
                  }
                >
                  Open event
                </button>
              </div>
            </div>
          )}

          {/* Divider */}
          <div
            style={{
              height: 1,
              background: "var(--border-hairline)",
              margin: "0 16px 20px",
            }}
          />

          {/* Timeline of today's events */}
          <div style={{ padding: "0 16px 32px", flex: 1 }}>
            {events.map((ev, i) => {
              const c = EVENT_COLORS[ev.type] || EVENT_COLORS.meeting;

              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 12,
                    paddingBottom: i < events.length - 1 ? 16 : 0,
                  }}
                >
                  {/* Time */}
                  <div style={{ width: 56, flexShrink: 0, paddingTop: 1 }}>
                    <span
                      style={{
                        fontSize: 10.5,
                        fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                        color: ev.isNext ? "var(--accent-text)" : "var(--text-disabled)",
                        fontWeight: ev.isNext ? 600 : 400,
                      }}
                    >
                      {ev.time}
                    </span>
                  </div>
                  {/* Bar + content */}
                  <div style={{ display: "flex", gap: 10, flex: 1 }}>
                    <div
                      style={{
                        width: 2.5,
                        borderRadius: 4,
                        background: ev.isNext ? c.line : "var(--border-hairline)",
                        flexShrink: 0,
                        minHeight: 36,
                        alignSelf: "stretch",
                      }}
                    />
                    <div style={{ paddingTop: 1 }}>
                      <div
                        style={{
                          fontSize: 12.5,
                          fontWeight: ev.isNext ? 600 : 400,
                          color: ev.isNext ? c.text : "var(--text-secondary)",
                          fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
                        }}
                      >
                        {ev.label}
                      </div>
                      {ev.detail && (
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--text-muted)",
                            fontFamily: "var(--font-body, 'Inter', system-ui, sans-serif)",
                            marginTop: 2,
                          }}
                        >
                          {ev.detail}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

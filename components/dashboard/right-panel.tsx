"use client";

import React from "react";
import { CalendarEvent } from "./types";
import { EVENTS, EVENT_COLORS } from "./mock-data";

export interface RightPanelProps {
  events?: CalendarEvent[];
  onOpenCalendar: () => void;
  onOpenNextEvent?: (event: CalendarEvent) => void;
}

export function RightPanel({
  events = EVENTS,
  onOpenCalendar,
  onOpenNextEvent,
}: RightPanelProps) {
  const nextEvent = events.find((e) => e.isNext) || events[0];

  return (
    <div
      style={{
        width: 252,
        flexShrink: 0,
        borderLeft: "1px solid #E8E4DC",
        background: "#FDFCF9",
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
              color: "#1A1917",
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
              color: "#B8B3AB",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
              padding: 0,
              transition: "color 0.12s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#5549C0")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#B8B3AB")}
          >
            Open →
          </button>
        </div>
        <div
          style={{
            fontSize: 11.5,
            color: "#B8B3AB",
            fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
            marginTop: 2,
          }}
        >
          Sunday, Aug 31
        </div>
      </div>

      {/* Next up card */}
      {nextEvent && (
        <div style={{ padding: "0 16px 20px" }}>
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 11,
              background: "linear-gradient(145deg, #EDEAFB 0%, #F5EFE8 100%)",
              border: "1px solid #D8D5F0",
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
                background: "rgba(85,73,192,0.08)",
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                fontSize: 9.5,
                fontWeight: 600,
                letterSpacing: "0.1em",
                color: "#9B9691",
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
                color: "#1A1917",
                letterSpacing: "-0.045em",
                fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
                lineHeight: 1,
              }}
            >
              11:00 AM
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#1A1917",
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
                  color: "#7B72D4",
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
                color: "#9B9691",
                fontFamily: "var(--font-body, 'Inter', system-ui, sans-serif)",
                marginBottom: 14,
              }}
            >
              In 24 minutes
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
                color: "#5549C0",
                background: "rgba(255,255,255,0.6)",
                border: "1px solid rgba(85,73,192,0.18)",
                borderRadius: 7,
                padding: "5px 12px",
                cursor: "pointer",
                fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
                backdropFilter: "blur(4px)",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.9)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.6)")
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
          background: "#EDEAE4",
          margin: "0 16px 20px",
        }}
      />

      {/* Timeline */}
      <div style={{ padding: "0 16px 32px", flex: 1 }}>
        {events.map((ev, i) => {
          const c = EVENT_COLORS[ev.type];
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
              <div style={{ width: 36, flexShrink: 0, paddingTop: 1 }}>
                <span
                  style={{
                    fontSize: 10.5,
                    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                    color: ev.isNext ? "#5549C0" : "#C0BCB5",
                    fontWeight: ev.isNext ? 500 : 400,
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
                    background: ev.isNext ? c.line : "#E4E0D8",
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
                      color: ev.isNext ? c.text : "#3D3C3A",
                      fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
                    }}
                  >
                    {ev.label}
                  </div>
                  {ev.detail && (
                    <div
                      style={{
                        fontSize: 11,
                        color: "#B8B3AB",
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
    </div>
  );
}

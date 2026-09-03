"use client";

import React from "react";
import { CalEvent, fmtTime } from "./types";
import { EV_S, WEEK_DAYS } from "./constants";

export interface EventPopoverProps {
  event: CalEvent;
  onClose: () => void;
  onEdit?: (event: CalEvent) => void;
  onDelete?: (event: CalEvent) => void;
}

export function EventPopover({
  event,
  onClose,
  onEdit,
  onDelete,
}: EventPopoverProps) {
  const s = EV_S[event.type];
  const day = WEEK_DAYS[event.day] || WEEK_DAYS[3];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 40,
        }}
      />

      {/* Popover Card */}
      <div
        style={{
          position: "fixed",
          top: 80,
          right: 32,
          width: 300,
          zIndex: 41,
          background: "#FFFFFF",
          border: "1px solid #E4E0D8",
          borderRadius: 14,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
          overflow: "hidden",
          animation: "popIn 0.15s ease",
          fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
        }}
      >
        <style>{`@keyframes popIn { from { opacity:0; transform:scale(0.96) translateY(-4px) } to { opacity:1; transform:scale(1) translateY(0) } }`}</style>

        {/* Color bar */}
        <div style={{ height: 3.5, background: s.bar }} />

        <div style={{ padding: "18px 20px 20px" }}>
          {/* Header Title */}
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#1A1917",
              marginBottom: 6,
              letterSpacing: "-0.02em",
            }}
          >
            {event.title}
          </div>

          {/* Time */}
          <div
            style={{
              fontSize: 12.5,
              color: "#6B6762",
              fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
              marginBottom: event.location || event.attendees ? 14 : 0,
            }}
          >
            {day.monthStr} {day.dateNum} · {fmtTime(event.startH)} – {fmtTime(event.endH)}
          </div>

          {/* Location */}
          {event.location && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                fontSize: 12.5,
                color: "#6B6762",
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 2,
                  background: s.bar,
                  flexShrink: 0,
                }}
              />
              {event.location}
            </div>
          )}

          {/* Attendees */}
          {event.attendees && event.attendees.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  color: "#B8B3AB",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Attendees
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {event.attendees.map((a) => (
                  <div
                    key={a}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 12.5,
                      color: "#3D3C3A",
                    }}
                  >
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 6,
                        background: "#EAE8F8",
                        color: "#5549C0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 9.5,
                        fontWeight: 700,
                        letterSpacing: 0.3,
                        flexShrink: 0,
                      }}
                    >
                      {a
                        .split(" ")
                        .map((p) => p[0])
                        .join("")}
                    </div>
                    <span>{a}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div
            style={{
              display: "flex",
              gap: 8,
              paddingTop: 14,
              borderTop: "1px solid #F0EDE7",
            }}
          >
            {event.location?.includes("Meet") && (
              <button
                type="button"
                style={{
                  flex: 1,
                  fontSize: 12.5,
                  fontWeight: 500,
                  color: "#FFF",
                  background: "#5549C0",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 0",
                  cursor: "pointer",
                  transition: "opacity 0.12s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Join meeting
              </button>
            )}

            <button
              type="button"
              onClick={() => onEdit?.(event)}
              style={{
                fontSize: 12.5,
                color: "#7B7775",
                background: "transparent",
                border: "1px solid #E4E0D8",
                borderRadius: 8,
                padding: "8px 12px",
                cursor: "pointer",
                transition: "background 0.12s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#F5F2EC")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              Edit
            </button>

            <button
              type="button"
              onClick={() => {
                onDelete?.(event);
                onClose();
              }}
              style={{
                fontSize: 12.5,
                color: "#C9826B",
                background: "transparent",
                border: "1px solid #EDD8D0",
                borderRadius: 8,
                padding: "8px 12px",
                cursor: "pointer",
                transition: "background 0.12s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#FDF2EF")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

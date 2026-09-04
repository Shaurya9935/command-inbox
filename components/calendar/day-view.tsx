"use client";

import React, { useRef, useEffect } from "react";
import { CalEvent, fmtTime } from "./types";
import { EV_S, GRID_END, GRID_START, HOUR_PX } from "./constants";

const SHORT_MONTH = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];
const SHORT_DAY = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

export interface DayViewProps {
  events: CalEvent[];
  selectedEventId?: number | string | null;
  onSelectEvent: (event: CalEvent) => void;
  /** The date being displayed. Defaults to today. */
  viewDate?: Date;
  /** Live fractional hour for the time needle (e.g. 14.5 = 2:30 PM) */
  nowH?: number;
}

export function DayView({
  events,
  selectedEventId,
  onSelectEvent,
  viewDate,
  nowH,
}: DayViewProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const displayDate = viewDate ?? new Date();

  // Scroll to current time on mount
  useEffect(() => {
    if (gridRef.current && nowH !== undefined) {
      gridRef.current.scrollTop = Math.max(0, (nowH - GRID_START - 2) * HOUR_PX);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hours = Array.from({ length: GRID_END - GRID_START }, (_, i) => GRID_START + i);
  const totalH = (GRID_END - GRID_START) * HOUR_PX;
  const nowTop = nowH !== undefined ? (nowH - GRID_START) * HOUR_PX : null;

  // Check if viewDate is today
  const todayLocal = new Date();
  const isToday =
    displayDate.getFullYear() === todayLocal.getFullYear() &&
    displayDate.getMonth() === todayLocal.getMonth() &&
    displayDate.getDate() === todayLocal.getDate();

  // Day label: Mon-first index
  const jsDay = displayDate.getDay(); // 0=Sun
  const monFirstIdx = (jsDay + 6) % 7;
  const dayLabel = SHORT_DAY[monFirstIdx];
  const dayNum = displayDate.getDate();
  const monthStr = SHORT_MONTH[displayDate.getMonth()];

  const renderEvent = (ev: CalEvent) => {
    const evTop = (ev.startH - GRID_START) * HOUR_PX + 2;
    const evH = Math.max((ev.endH - ev.startH) * HOUR_PX - 4, 24);
    const s = EV_S[ev.type] || EV_S.meeting;
    const isSel = selectedEventId === ev.id;

    return (
      <div
        key={ev.id}
        onClick={(e) => {
          e.stopPropagation();
          onSelectEvent(ev);
        }}
        style={{
          position: "absolute",
          top: evTop,
          left: 12,
          right: 12,
          height: evH,
          borderRadius: 8,
          background: s.bg,
          border: `1px solid ${isSel ? s.bar : s.border}`,
          borderLeft: `4px solid ${s.bar}`,
          padding: "6px 12px",
          cursor: "pointer",
          overflow: "hidden",
          boxShadow: isSel ? `0 0 0 2.5px ${s.bar}40` : "0 1px 3px rgba(0,0,0,0.03)",
          transition: "box-shadow 0.12s",
          zIndex: isSel ? 2 : 1,
        }}
        onMouseEnter={(e) => {
          if (!isSel) (e.currentTarget as HTMLDivElement).style.boxShadow = "0 3px 10px rgba(0,0,0,0.08)";
        }}
        onMouseLeave={(e) => {
          if (!isSel) (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.03)";
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: s.text,
            lineHeight: 1.3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {ev.title}
        </div>
        <div
          style={{
            fontSize: 11,
            color: s.text + "B3",
            fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
            marginTop: 2,
          }}
        >
          {fmtTime(ev.startH)} – {fmtTime(ev.endH)}
        </div>
        {ev.location && (
          <div
            style={{
              fontSize: 11,
              color: s.text + "99",
              marginTop: 3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {ev.location}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Day header banner */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid #EDEAE4",
          background: "#FDFCF8",
          flexShrink: 0,
        }}
      >
        <div style={{ width: 56, flexShrink: 0 }} />
        <div
          style={{
            flex: 1,
            textAlign: "center",
            padding: "12px 0 10px",
            borderLeft: "1px solid #EDEAE4",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.07em",
              color: isToday ? "#5549C0" : "#B8B3AB",
              textTransform: "uppercase",
              fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
            }}
          >
            {dayLabel}
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "-0.04em",
              color: isToday ? "#FFF" : "#2D2C2A",
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: isToday ? "#5549C0" : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "4px auto 0",
              fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
            }}
          >
            {dayNum}
          </div>
          <div
            style={{
              fontSize: 10.5,
              color: "#C5C0B8",
              marginTop: 2,
              fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
            }}
          >
            {monthStr} {displayDate.getFullYear()}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div ref={gridRef} style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ display: "flex", height: totalH }}>
          {/* Time gutter */}
          <div style={{ width: 56, flexShrink: 0, position: "relative" }}>
            {hours.map((h) => (
              <div
                key={h}
                style={{
                  position: "absolute",
                  top: (h - GRID_START) * HOUR_PX - 8,
                  right: 10,
                  fontSize: 10,
                  color: "#C5C0B8",
                  fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                  letterSpacing: "-0.01em",
                  lineHeight: 1,
                }}
              >
                {h === 12 ? "12 PM" : h > 12 ? `${h - 12} PM` : `${h} AM`}
              </div>
            ))}
          </div>

          {/* Single day column */}
          <div
            style={{
              flex: 1,
              position: "relative",
              borderLeft: "1px solid #EDEAE4",
              background: isToday ? "rgba(85,73,192,0.012)" : "transparent",
            }}
          >
            {/* Hour lines */}
            {hours.map((h) => (
              <div
                key={h}
                style={{
                  position: "absolute",
                  top: (h - GRID_START) * HOUR_PX,
                  left: 0,
                  right: 0,
                  borderTop: `1px solid ${h % 2 === 0 ? "#EDEAE4" : "#F5F2EC"}`,
                  pointerEvents: "none",
                }}
              />
            ))}

            {/* Events for today */}
            {events.map((ev) => renderEvent(ev))}

            {/* Current time needle (only if today) */}
            {isToday && nowTop !== null && nowTop >= 0 && (
              <>
                <div
                  style={{
                    position: "absolute",
                    top: nowTop - 4.5,
                    left: -6,
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "#5549C0",
                    zIndex: 3,
                    pointerEvents: "none",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: nowTop,
                    left: 0,
                    right: 0,
                    height: 1.5,
                    background: "rgba(85,73,192,0.45)",
                    zIndex: 3,
                    pointerEvents: "none",
                  }}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

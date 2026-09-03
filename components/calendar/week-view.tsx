"use client";

import React, { useRef, useEffect } from "react";
import { CalEvent, fmtTime, WeekDay } from "./types";
import { EV_S, GRID_END, GRID_START, HOUR_PX, NOW_H, WEEK_DAYS } from "./constants";

export interface WeekViewProps {
  events: CalEvent[];
  selectedEventId?: number | string | null;
  onSelectEvent: (event: CalEvent) => void;
  weekDays?: WeekDay[];
}

export function WeekView({
  events,
  selectedEventId,
  onSelectEvent,
  weekDays = WEEK_DAYS,
}: WeekViewProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.scrollTop = Math.max(0, (NOW_H - GRID_START - 2) * HOUR_PX);
    }
  }, []);

  const hours = Array.from({ length: GRID_END - GRID_START }, (_, i) => GRID_START + i);
  const totalH = (GRID_END - GRID_START) * HOUR_PX;
  const nowTop = (NOW_H - GRID_START) * HOUR_PX;

  const renderEvent = (ev: CalEvent) => {
    const evTop = (ev.startH - GRID_START) * HOUR_PX + 2;
    const evH = Math.max((ev.endH - ev.startH) * HOUR_PX - 4, 20);
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
          left: 3,
          right: 3,
          height: evH,
          borderRadius: 7,
          background: s.bg,
          border: `1px solid ${isSel ? s.bar : s.border}`,
          borderLeft: `3px solid ${s.bar}`,
          padding: "4px 8px",
          cursor: "pointer",
          overflow: "hidden",
          boxShadow: isSel ? `0 0 0 2.5px ${s.bar}40` : "none",
          transition: "box-shadow 0.12s",
          zIndex: isSel ? 2 : 1,
        }}
        onMouseEnter={(e) => {
          if (!isSel) (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.09)";
        }}
        onMouseLeave={(e) => {
          if (!isSel) (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
        }}
      >
        <div
          style={{
            fontSize: 11.5,
            fontWeight: 600,
            color: s.text,
            lineHeight: 1.25,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {ev.title}
        </div>
        {evH > 32 && (
          <div style={{ fontSize: 10.5, color: s.text + "99", marginTop: 1 }}>
            {fmtTime(ev.startH)}–{fmtTime(ev.endH)}
          </div>
        )}
        {evH > 50 && ev.location && (
          <div
            style={{
              fontSize: 10.5,
              color: s.text + "80",
              marginTop: 1,
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
      {/* Day headers */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid #EDEAE4",
          background: "#FDFCF8",
          flexShrink: 0,
        }}
      >
        <div style={{ width: 56, flexShrink: 0 }} />
        {weekDays.map((d, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              textAlign: "center",
              padding: "10px 4px 8px",
              borderLeft: "1px solid #EDEAE4",
              background: d.isToday ? "rgba(85,73,192,0.025)" : "transparent",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.07em",
                color: d.isToday ? "#5549C0" : "#B8B3AB",
                textTransform: "uppercase",
              }}
            >
              {d.label}
            </div>
            <div
              style={{
                fontSize: 17,
                fontWeight: d.isToday ? 700 : 400,
                letterSpacing: "-0.03em",
                color: d.isToday ? "#FFF" : i >= 5 ? "#B8B3AB" : "#2D2C2A",
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: d.isToday ? "#5549C0" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "4px auto 0",
              }}
            >
              {d.dateNum}
            </div>
          </div>
        ))}
      </div>

      {/* Scrollable grid */}
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

          {/* Day columns */}
          {weekDays.map((d, di) => (
            <div
              key={di}
              style={{
                flex: 1,
                position: "relative",
                borderLeft: "1px solid #EDEAE4",
                background: d.isToday ? "rgba(85,73,192,0.012)" : "transparent",
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

              {/* Events for this day */}
              {events
                .filter((e) => e.day === di)
                .map((ev) => renderEvent(ev))}

              {/* Today current time needle */}
              {d.isToday && (
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
          ))}
        </div>
      </div>
    </div>
  );
}

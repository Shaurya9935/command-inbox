"use client";

import React from "react";
import { EventType, MonthCell } from "./types";
import { EV_S } from "./constants";

export interface MonthViewProps {
  cells: MonthCell[];
  monthEvents?: Record<string, { title: string; type: EventType }[]>;
  onSelectDate?: (dateKey: string, fullDate?: Date) => void;
}

export function MonthView({
  cells,
  monthEvents = {},
  onSelectDate,
}: MonthViewProps) {
  // How many rows does the grid have?
  const rowCount = Math.ceil(cells.length / 7);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 0, display: "flex", flexDirection: "column" }}>
      {/* Day-of-week headers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          borderBottom: "1px solid #EDEAE4",
          background: "#FDFCF8",
        }}
      >
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
          <div
            key={d}
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.07em",
              color: i >= 5 ? "#C5C0B8" : "#B8B3AB",
              textTransform: "uppercase",
              textAlign: "center",
              padding: "10px 0 8px",
              fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grid cells */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gridTemplateRows: `repeat(${rowCount}, 1fr)`,
          flex: 1,
          minHeight: 480,
        }}
      >
        {cells.map((cell) => {
          const evs = monthEvents[cell.key] ?? [];

          return (
            <div
              key={cell.key}
              onClick={() => onSelectDate?.(cell.key, cell.fullDate)}
              style={{
                borderRight: "1px solid #EDEAE4",
                borderBottom: "1px solid #EDEAE4",
                padding: "8px 8px 6px",
                minHeight: 96,
                background: cell.isToday ? "rgba(85,73,192,0.03)" : "transparent",
                cursor: "pointer",
                transition: "background 0.12s",
              }}
              onMouseEnter={(e) => {
                if (!cell.isToday) e.currentTarget.style.background = "#F9F6F0";
              }}
              onMouseLeave={(e) => {
                if (!cell.isToday) e.currentTarget.style.background = "transparent";
              }}
            >
              {/* Date number badge */}
              <div
                style={{
                  fontSize: 12.5,
                  fontWeight: cell.isToday ? 700 : 400,
                  color: cell.isToday ? "#FFF" : !cell.inMonth ? "#D0CCC6" : "#2D2C2A",
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: cell.isToday ? "#5549C0" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 4,
                  fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
                }}
              >
                {cell.date}
              </div>

              {/* Event chips */}
              {evs.slice(0, 3).map((ev, ei) => {
                const s = EV_S[ev.type] || EV_S.meeting;

                return (
                  <div
                    key={ei}
                    style={{
                      fontSize: 10.5,
                      color: s.text,
                      background: s.bg,
                      borderLeft: `2px solid ${s.bar}`,
                      borderRadius: "0 4px 4px 0",
                      padding: "2px 5px",
                      marginBottom: 2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      cursor: "pointer",
                      lineHeight: 1.3,
                      fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
                    }}
                  >
                    {ev.title}
                  </div>
                );
              })}

              {evs.length > 3 && (
                <div
                  style={{
                    fontSize: 10,
                    color: "#9B9691",
                    paddingLeft: 2,
                    fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
                  }}
                >
                  +{evs.length - 3} more
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

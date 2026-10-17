"use client";

import React, { useState, useMemo } from "react";
import { CalEvent } from "./types";

export interface NewEventFormProps {
  onClose: () => void;
  onCreateEvent?: (event: Partial<CalEvent>) => void;
  initialDate?: Date;
}

function parseTimeString(timeStr: string, fallbackH: number): number {
  const trimmed = timeStr.trim().toLowerCase();
  const match = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if (!match) return fallbackH;
  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const period = match[3];
  if (period === "pm" && hours < 12) hours += 12;
  if (period === "am" && hours === 12) hours = 0;
  return hours + minutes / 60;
}

function parseDateString(dateStr: string, fallbackDate?: Date): Date {
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) return parsed;
  return fallbackDate || new Date();
}

export function NewEventForm({ onClose, onCreateEvent, initialDate }: NewEventFormProps) {
  const initialDateFormatted = useMemo(() => {
    const d = initialDate || new Date();
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }, [initialDate]);

  const [title, setTitle] = useState("");
  const [dateStr, setDateStr] = useState(initialDateFormatted);
  const [startTime, setStartTime] = useState("9:00 AM");
  const [endTime, setEndTime] = useState("10:00 AM");
  const [calendar, setCalendar] = useState("Work");
  const [location, setLocation] = useState("");
  const [guests, setGuests] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (!title.trim()) return;

    const baseDate = parseDateString(dateStr, initialDate);
    const startH = parseTimeString(startTime, 9.0);
    const endH = parseTimeString(endTime, 10.0);
    const validEndH = endH > startH ? endH : startH + 1.0;

    const day = (baseDate.getDay() + 6) % 7;
    const startHour = Math.floor(startH);
    const startMin = Math.round((startH % 1) * 60);
    const endHour = Math.floor(validEndH);
    const endMin = Math.round((validEndH % 1) * 60);

    const startD = new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate(),
      startHour,
      startMin
    );
    const endD = new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate(),
      endHour,
      endMin
    );

    onCreateEvent?.({
      title: title.trim(),
      type: calendar.toLowerCase().includes("work") ? "meeting" : "personal",
      location: location.trim() || undefined,
      attendees: guests
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean),
      description: description.trim() || undefined,
      startH,
      endH: validEndH,
      day,
      startDateIso: startD.toISOString(),
      endDateIso: endD.toISOString(),
    });

    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "var(--overlay)",
          backdropFilter: "blur(2px)",
          zIndex: 50,
        }}
      />

      {/* Modal Dialog */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 480,
          maxWidth: "92vw",
          background: "var(--surface-card)",
          border: "1px solid var(--border-hairline)",
          borderRadius: 16,
          boxShadow: "0 24px 64px var(--shadow-color)",
          zIndex: 51,
          animation: "popIn 0.18s ease",
          fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px 16px",
            borderBottom: "1px solid var(--border-hairline)",
          }}
        >
          <span
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            New event
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              border: "1px solid var(--border-hairline)",
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted)",
              fontSize: 18,
              lineHeight: 1,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hover-subtle)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            ×
          </button>
        </div>

        {/* Body Fields */}
        <div style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Title Input */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event title"
            autoFocus
            style={{
              border: "none",
              borderBottom: "1.5px solid var(--border-hairline)",
              background: "transparent",
              outline: "none",
              fontSize: 17,
              fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
              fontWeight: 500,
              color: "var(--text-primary)",
              padding: "4px 0 8px",
              width: "100%",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-text)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-hairline)")}
          />

          {/* Date & time row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  marginBottom: 5,
                }}
              >
                Date
              </div>
              <input
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                placeholder={initialDateFormatted || "e.g. Oct 2, 2026"}
                style={{
                  width: "100%",
                  border: "1px solid var(--border-hairline)",
                  borderRadius: 8,
                  background: "var(--bg-panel)",
                  outline: "none",
                  fontSize: 12.5,
                  color: "var(--text-primary)",
                  padding: "7px 10px",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-text)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-hairline)")}
              />
            </div>

            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  marginBottom: 5,
                }}
              >
                Start
              </div>
              <input
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="9:00 AM"
                style={{
                  width: "100%",
                  border: "1px solid var(--border-hairline)",
                  borderRadius: 8,
                  background: "var(--bg-panel)",
                  outline: "none",
                  fontSize: 12.5,
                  color: "var(--text-primary)",
                  padding: "7px 10px",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-text)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-hairline)")}
              />
            </div>

            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  marginBottom: 5,
                }}
              >
                End
              </div>
              <input
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="10:00 AM"
                style={{
                  width: "100%",
                  border: "1px solid var(--border-hairline)",
                  borderRadius: 8,
                  background: "var(--bg-panel)",
                  outline: "none",
                  fontSize: 12.5,
                  color: "var(--text-primary)",
                  padding: "7px 10px",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-text)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-hairline)")}
              />
            </div>
          </div>

          {/* Calendar, Location, Guests */}
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.08em",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                marginBottom: 5,
              }}
            >
              Calendar
            </div>
            <input
              value={calendar}
              onChange={(e) => setCalendar(e.target.value)}
              placeholder="Work"
              style={{
                width: "100%",
                border: "1px solid var(--border-hairline)",
                borderRadius: 8,
                background: "var(--bg-panel)",
                outline: "none",
                fontSize: 12.5,
                color: "var(--text-primary)",
                padding: "7px 10px",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-text)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-hairline)")}
            />
          </div>

          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.08em",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                marginBottom: 5,
              }}
            >
              Location
            </div>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Add location or meeting link"
              style={{
                width: "100%",
                border: "1px solid var(--border-hairline)",
                borderRadius: 8,
                background: "var(--bg-panel)",
                outline: "none",
                fontSize: 12.5,
                color: "var(--text-primary)",
                padding: "7px 10px",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-text)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-hairline)")}
            />
          </div>

          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.08em",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                marginBottom: 5,
              }}
            >
              Guests
            </div>
            <input
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              placeholder="Add guests separated by comma"
              style={{
                width: "100%",
                border: "1px solid var(--border-hairline)",
                borderRadius: 8,
                background: "var(--bg-panel)",
                outline: "none",
                fontSize: 12.5,
                color: "var(--text-primary)",
                padding: "7px 10px",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-text)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-hairline)")}
            />
          </div>

          {/* Description */}
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.08em",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                marginBottom: 5,
              }}
            >
              Description
            </div>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add description"
              style={{
                width: "100%",
                border: "1px solid var(--border-hairline)",
                borderRadius: 8,
                background: "var(--bg-panel)",
                outline: "none",
                resize: "none",
                fontSize: 12.5,
                color: "var(--text-primary)",
                padding: "7px 10px",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-text)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-hairline)")}
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 6 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
                background: "transparent",
                border: "1px solid var(--border-hairline)",
                borderRadius: 8,
                padding: "8px 16px",
                cursor: "pointer",
                transition: "background 0.12s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hover-subtle)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--on-accent)",
                background: title.trim() ? "var(--accent-solid)" : "var(--accent-border)",
                border: "none",
                borderRadius: 8,
                padding: "8px 20px",
                cursor: title.trim() ? "pointer" : "default",
                transition: "opacity 0.12s",
              }}
              onMouseEnter={(e) => {
                if (title.trim()) e.currentTarget.style.opacity = "0.88";
              }}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Create event
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

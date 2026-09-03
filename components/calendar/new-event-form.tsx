"use client";

import React, { useState } from "react";
import { CalEvent } from "./types";

export interface NewEventFormProps {
  onClose: () => void;
  onCreateEvent?: (event: Partial<CalEvent>) => void;
}

export function NewEventForm({ onClose, onCreateEvent }: NewEventFormProps) {
  const [title, setTitle] = useState("");
  const [dateStr, setDateStr] = useState("Sep 3, 2026");
  const [startTime, setStartTime] = useState("9:00 AM");
  const [endTime, setEndTime] = useState("10:00 AM");
  const [calendar, setCalendar] = useState("Work");
  const [location, setLocation] = useState("");
  const [guests, setGuests] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (!title.trim()) return;

    onCreateEvent?.({
      title: title.trim(),
      type: calendar.toLowerCase().includes("work") ? "meeting" : "personal",
      location: location.trim() || undefined,
      attendees: guests
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean),
      description: description.trim() || undefined,
      startH: 9.0,
      endH: 10.0,
      day: 3,
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
          background: "rgba(26,25,23,0.3)",
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
          background: "#FFFFFF",
          border: "1px solid #E4E0D8",
          borderRadius: 16,
          boxShadow: "0 24px 64px rgba(0,0,0,0.14)",
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
            borderBottom: "1px solid #F0EDE7",
          }}
        >
          <span
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#1A1917",
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
              border: "1px solid #E4E0D8",
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#9B9691",
              fontSize: 18,
              lineHeight: 1,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#F5F2EC")}
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
              borderBottom: "1.5px solid #E4E0D8",
              background: "transparent",
              outline: "none",
              fontSize: 17,
              fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
              fontWeight: 500,
              color: "#1A1917",
              padding: "4px 0 8px",
              width: "100%",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#5549C0")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#E4E0D8")}
          />

          {/* Date & time row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  color: "#B8B3AB",
                  textTransform: "uppercase",
                  marginBottom: 5,
                }}
              >
                Date
              </div>
              <input
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                placeholder="Sep 3, 2026"
                style={{
                  width: "100%",
                  border: "1px solid #E4E0D8",
                  borderRadius: 8,
                  background: "#FDFCF9",
                  outline: "none",
                  fontSize: 12.5,
                  color: "#3D3C3A",
                  padding: "7px 10px",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#5549C0")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#E4E0D8")}
              />
            </div>

            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  color: "#B8B3AB",
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
                  border: "1px solid #E4E0D8",
                  borderRadius: 8,
                  background: "#FDFCF9",
                  outline: "none",
                  fontSize: 12.5,
                  color: "#3D3C3A",
                  padding: "7px 10px",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#5549C0")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#E4E0D8")}
              />
            </div>

            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  color: "#B8B3AB",
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
                  border: "1px solid #E4E0D8",
                  borderRadius: 8,
                  background: "#FDFCF9",
                  outline: "none",
                  fontSize: 12.5,
                  color: "#3D3C3A",
                  padding: "7px 10px",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#5549C0")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#E4E0D8")}
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
                color: "#B8B3AB",
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
                border: "1px solid #E4E0D8",
                borderRadius: 8,
                background: "#FDFCF9",
                outline: "none",
                fontSize: 12.5,
                color: "#3D3C3A",
                padding: "7px 10px",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#5549C0")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E4E0D8")}
            />
          </div>

          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.08em",
                color: "#B8B3AB",
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
                border: "1px solid #E4E0D8",
                borderRadius: 8,
                background: "#FDFCF9",
                outline: "none",
                fontSize: 12.5,
                color: "#3D3C3A",
                padding: "7px 10px",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#5549C0")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E4E0D8")}
            />
          </div>

          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.08em",
                color: "#B8B3AB",
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
                border: "1px solid #E4E0D8",
                borderRadius: 8,
                background: "#FDFCF9",
                outline: "none",
                fontSize: 12.5,
                color: "#3D3C3A",
                padding: "7px 10px",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#5549C0")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E4E0D8")}
            />
          </div>

          {/* Description */}
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.08em",
                color: "#B8B3AB",
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
                border: "1px solid #E4E0D8",
                borderRadius: 8,
                background: "#FDFCF9",
                outline: "none",
                resize: "none",
                fontSize: 12.5,
                color: "#3D3C3A",
                padding: "7px 10px",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#5549C0")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E4E0D8")}
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 6 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                fontSize: 13,
                color: "#7B7775",
                background: "transparent",
                border: "1px solid #E4E0D8",
                borderRadius: 8,
                padding: "8px 16px",
                cursor: "pointer",
                transition: "background 0.12s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#F5F2EC")}
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
                color: "#FFF",
                background: title.trim() ? "#5549C0" : "#C4BFF0",
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

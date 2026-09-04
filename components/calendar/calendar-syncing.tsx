"use client";

import React from "react";
import { CalendarIcon } from "@/components/dashboard/icons";

interface CalendarSyncingViewProps {
  message?: string;
  subMessage?: string;
}

export function CalendarSyncingView({
  message = "Syncing Google Calendar…",
  subMessage = "Connecting to Google Calendar to load your meetings and schedule",
}: CalendarSyncingViewProps) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: "#FDFCF8",
        overflow: "hidden",
        position: "relative",
        userSelect: "none",
      }}
    >
      <style>{`
        @keyframes pulseRing {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.08); opacity: 0.3; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes calShimmer {
          0% { opacity: 0.4; transform: translateY(0); }
          50% { opacity: 0.75; transform: translateY(-1px); }
          100% { opacity: 0.4; transform: translateY(0); }
        }
      `}</style>

      {/* Top skeleton header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 24px",
          borderBottom: "1px solid #E8E4DC",
          background: "#FDFCF8",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 140,
              height: 22,
              borderRadius: 6,
              background: "#EFECE6",
              animation: "calShimmer 1.8s infinite ease-in-out",
            }}
          />
          <div
            style={{
              width: 54,
              height: 24,
              borderRadius: 6,
              background: "#F5F2EC",
              animation: "calShimmer 1.8s infinite ease-in-out",
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 180,
              height: 28,
              borderRadius: 7,
              background: "#F2EFEB",
              animation: "calShimmer 1.8s infinite ease-in-out",
            }}
          />
        </div>
      </div>

      {/* Main Skeleton Calendar Columns with Overlaid Centered Syncing Card */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {/* Background Grid Skeleton */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "60px repeat(7, 1fr)",
            height: "100%",
            opacity: 0.5,
          }}
        >
          {/* Time sidebar skeleton */}
          <div
            style={{
              borderRight: "1px solid #EDE9E1",
              padding: "14px 6px",
              display: "flex",
              flexDirection: "column",
              gap: 40,
            }}
          >
            {[9, 10, 11, 12, 1, 2, 3, 4, 5].map((hour) => (
              <div
                key={hour}
                style={{
                  width: 38,
                  height: 10,
                  borderRadius: 4,
                  background: "#E8E4DC",
                  animation: "calShimmer 1.8s infinite ease-in-out",
                }}
              />
            ))}
          </div>

          {/* 7 day columns with shimmering mock blocks */}
          {[0, 1, 2, 3, 4, 5, 6].map((dayIdx) => (
            <div
              key={dayIdx}
              style={{
                borderRight: "1px solid #EDE9E1",
                padding: "16px 8px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {/* Day header */}
              <div
                style={{
                  width: "60%",
                  height: 14,
                  borderRadius: 4,
                  background: "#EAE6DE",
                  marginBottom: 12,
                  animation: "calShimmer 1.8s infinite ease-in-out",
                }}
              />

              {/* Shimmering event boxes */}
              {dayIdx % 2 === 0 && (
                <div
                  style={{
                    height: 52,
                    borderRadius: 8,
                    background: "#EDEAFB",
                    border: "1px solid #C4BFF0",
                    animation: "calShimmer 2s infinite ease-in-out",
                  }}
                />
              )}
              {dayIdx % 3 === 0 && (
                <div
                  style={{
                    height: 64,
                    marginTop: 20,
                    borderRadius: 8,
                    background: "#EEF4F1",
                    border: "1px solid #B8D4C0",
                    animation: "calShimmer 2.2s infinite ease-in-out",
                  }}
                />
              )}
              {dayIdx % 2 === 1 && (
                <div
                  style={{
                    height: 46,
                    marginTop: 48,
                    borderRadius: 8,
                    background: "#F5F0E8",
                    border: "1px solid #DDD0BE",
                    animation: "calShimmer 1.9s infinite ease-in-out",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Central Syncing Modal / Card */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(253, 252, 248, 0.72)",
            backdropFilter: "blur(2px)",
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E8E4DC",
              borderRadius: 16,
              padding: "36px 42px",
              boxShadow: "0 12px 36px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.03)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              maxWidth: 380,
              animation: "fadeIn 0.25s ease-out",
            }}
          >
            {/* Pulsing Icon */}
            <div style={{ position: "relative", marginBottom: 20 }}>
              <div
                style={{
                  position: "absolute",
                  inset: -8,
                  borderRadius: "50%",
                  background: "#EAE8F8",
                  animation: "pulseRing 2.2s infinite ease-in-out",
                }}
              />
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #5549C0 0%, #7B6ED8 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  position: "relative",
                  boxShadow: "0 6px 18px rgba(85, 73, 192, 0.28)",
                }}
              >
                <CalendarIcon size={26} />
              </div>
              {/* Spinner badge */}
              <div
                style={{
                  position: "absolute",
                  bottom: -2,
                  right: -2,
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "#FFFFFF",
                  border: "2px solid #FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 16 16"
                  fill="none"
                  style={{ animation: "spin 0.8s linear infinite" }}
                >
                  <circle cx="8" cy="8" r="6" stroke="#EAE8F8" strokeWidth="2.5" />
                  <path d="M8 2a6 6 0 016 6" stroke="#5549C0" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            <h3
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#1A1917",
                letterSpacing: "-0.02em",
                margin: "0 0 6px",
              }}
            >
              {message}
            </h3>

            <p
              style={{
                fontSize: 12.5,
                color: "#7A7672",
                lineHeight: 1.5,
                margin: "0 0 20px",
              }}
            >
              {subMessage}
            </p>

            {/* Subtle status tag */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "3px 10px",
                borderRadius: 20,
                background: "#F5F2EC",
                color: "#6B6762",
                fontSize: 11,
                fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#5549C0",
                  display: "inline-block",
                }}
              />
              Fetching live events…
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CalendarEmptyViewProps {
  onSync: () => void;
  isSyncing?: boolean;
}

export function CalendarEmptyView({ onSync, isSyncing = false }: CalendarEmptyViewProps) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        textAlign: "center",
        background: "#FDFCF8",
      }}
    >
      <div
        style={{
          width: 58,
          height: 58,
          borderRadius: 14,
          background: "#F5F2EC",
          color: "#9B9691",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <CalendarIcon size={26} />
      </div>

      <h3
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: "#1A1917",
          letterSpacing: "-0.02em",
          margin: "0 0 6px",
        }}
      >
        No events found
      </h3>

      <p
        style={{
          fontSize: 13,
          color: "#7A7672",
          maxWidth: 340,
          lineHeight: 1.5,
          margin: "0 0 24px",
        }}
      >
        No upcoming events or meetings were found in your Google Calendar for this period.
      </p>

      <button
        onClick={onSync}
        disabled={isSyncing}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          padding: "8px 18px",
          background: isSyncing ? "#7B6ED8" : "#5549C0",
          color: "#FFFFFF",
          border: "none",
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 500,
          cursor: isSyncing ? "default" : "pointer",
          fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
          transition: "background 0.15s",
          boxShadow: "0 2px 8px rgba(85, 73, 192, 0.22)",
        }}
      >
        <CalendarIcon size={14} />
        <span>{isSyncing ? "Syncing…" : "Sync from Google Calendar"}</span>
      </button>
    </div>
  );
}

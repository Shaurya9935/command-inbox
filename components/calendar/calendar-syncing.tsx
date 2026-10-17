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
        background: "var(--bg-workspace)",
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
          borderBottom: "1px solid var(--border-hairline)",
          background: "var(--bg-workspace)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 140,
              height: 22,
              borderRadius: 6,
              background: "var(--hover)",
              animation: "calShimmer 1.8s infinite ease-in-out",
            }}
          />
          <div
            style={{
              width: 54,
              height: 24,
              borderRadius: 6,
              background: "var(--hover-subtle)",
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
              background: "var(--hover)",
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
              borderRight: "1px solid var(--border-hairline)",
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
                  background: "var(--border-hairline)",
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
                borderRight: "1px solid var(--border-hairline)",
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
                  background: "var(--hover)",
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
                    background: "var(--event-meeting-bg)",
                    border: "1px solid var(--event-meeting-border)",
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
                    background: "var(--event-focus-bg)",
                    border: "1px solid var(--event-focus-border)",
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
                    background: "var(--event-personal-bg)",
                    border: "1px solid var(--event-personal-border)",
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
            background: "color-mix(in srgb, var(--bg-workspace) 75%, transparent)",
            backdropFilter: "blur(2px)",
          }}
        >
          <div
            style={{
              background: "var(--surface-card)",
              border: "1px solid var(--border-hairline)",
              borderRadius: 16,
              padding: "36px 42px",
              boxShadow: "0 12px 36px var(--shadow-color), 0 2px 8px var(--shadow-color)",
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
                  background: "var(--accent-tint)",
                  animation: "pulseRing 2.2s infinite ease-in-out",
                }}
              />
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--accent-solid) 0%, var(--accent-hover) 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--on-accent)",
                  position: "relative",
                  boxShadow: "0 6px 18px var(--shadow-color)",
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
                  background: "var(--surface-card)",
                  border: "2px solid var(--surface-card)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 6px var(--shadow-color)",
                }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 16 16"
                  fill="none"
                  style={{ animation: "spin 0.8s linear infinite" }}
                >
                  <circle cx="8" cy="8" r="6" stroke="var(--accent-tint)" strokeWidth="2.5" />
                  <path d="M8 2a6 6 0 016 6" stroke="var(--accent-text)" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            <h3
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
                margin: "0 0 6px",
              }}
            >
              {message}
            </h3>

            <p
              style={{
                fontSize: 12.5,
                color: "var(--text-secondary)",
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
                background: "var(--hover-subtle)",
                color: "var(--text-secondary)",
                fontSize: 11,
                fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--accent-solid)",
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
        background: "var(--bg-workspace)",
      }}
    >
      <div
        style={{
          width: 58,
          height: 58,
          borderRadius: 14,
          background: "var(--hover-subtle)",
          color: "var(--text-muted)",
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
          color: "var(--text-primary)",
          letterSpacing: "-0.02em",
          margin: "0 0 6px",
        }}
      >
        No events found
      </h3>

      <p
        style={{
          fontSize: 13,
          color: "var(--text-secondary)",
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
          background: isSyncing ? "var(--accent-hover)" : "var(--accent-solid)",
          color: "var(--on-accent)",
          border: "none",
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 500,
          cursor: isSyncing ? "default" : "pointer",
          fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
          transition: "background 0.15s",
          boxShadow: "0 2px 8px var(--shadow-color)",
        }}
      >
        <CalendarIcon size={14} />
        <span>{isSyncing ? "Syncing…" : "Sync from Google Calendar"}</span>
      </button>
    </div>
  );
}

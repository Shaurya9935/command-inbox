"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { RightPanel } from "@/components/dashboard/right-panel";
import { CalendarIcon, SearchIcon } from "@/components/dashboard/icons";
import { CalendarWorkspace } from "@/components/calendar";
import { useGmailThreads } from "@/hooks/use-gmail";
import { useCalendarEvents } from "@/hooks/use-calendar";

export default function CalendarPage() {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { threads } = useGmailThreads();
  const { events, todayEvents, isSyncing, sync, lastSyncedAt } = useCalendarEvents();

  const unreadCount = Array.isArray(threads)
    ? threads.filter((t) => t.unread || t.data?.unread).length
    : 0;

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100%",
        background: "#F5F2EC",
        fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
        overflow: "hidden",
      }}
    >
      {/* ── Sidebar ── */}
      <Sidebar
        activeWorkspace="calendar"
        activeNav="today"
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        onSelectNav={(nav) => {
          if (nav === "inbox") {
            router.push("/dashboard/inbox");
          } else if (nav === "today" || nav === "upcoming") {
            // Already on calendar page
          } else {
            router.push("/dashboard");
          }
        }}
        onOpenCalendar={() => {}}
        onGoBack={() => router.push("/dashboard")}
        inboxBadge={unreadCount}
      />

      {/* ── Main Calendar Content Area ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          overflow: "hidden",
          background: "#FDFCF8",
        }}
      >
        {/* ── Top Header Bar ── */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 28px",
            borderBottom: "1px solid #E8E4DC",
            background: "#FDFCF8",
            flexShrink: 0,
            gap: 16,
          }}
        >
          {/* Service Title */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#5549C0", display: "flex" }}>
                <CalendarIcon size={16} />
              </span>
              <h1
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#1A1917",
                  margin: 0,
                  letterSpacing: "-0.02em",
                }}
              >
                Calendar
              </h1>
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                  color: "#5549C0",
                  background: "#EAE8F8",
                  padding: "2px 7px",
                  borderRadius: 12,
                  fontWeight: 500,
                }}
              >
                Google Calendar
              </span>
            </div>
          </div>

          {/* Search & Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "#F5F2EC",
                border: "1px solid #E4E0D8",
                borderRadius: 8,
                padding: "6px 12px",
                width: 240,
              }}
            >
              <span style={{ color: "#A8A49E", display: "flex" }}>
                <SearchIcon size={13} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events…"
                style={{
                  border: "none",
                  background: "transparent",
                  outline: "none",
                  fontSize: 13,
                  fontFamily: "var(--font-body, 'Inter', system-ui, sans-serif)",
                  color: "#1A1917",
                  width: "100%",
                }}
              />
            </div>

            {/* Last synced label */}
            {lastSyncedAt && !isSyncing && (
              <span
                style={{
                  fontSize: 11.5,
                  color: "#B8B3AB",
                  fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
                  whiteSpace: "nowrap",
                }}
              >
                Synced{" "}
                {(() => {
                  const diffMs = Date.now() - lastSyncedAt.getTime();
                  const diffMin = Math.floor(diffMs / 60000);
                  if (diffMin < 1) return "just now";
                  if (diffMin === 1) return "1 min ago";
                  return `${diffMin} min ago`;
                })()}
              </span>
            )}

            {/* Sync / Refresh button */}
            <button
              onClick={() => sync()}
              disabled={isSyncing}
              title="Fetch latest events from Google Calendar"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                background: isSyncing ? "#7B6ED8" : "#5549C0",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 500,
                cursor: isSyncing ? "default" : "pointer",
                opacity: isSyncing ? 0.85 : 1,
                fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
                transition: "background 0.15s, opacity 0.15s",
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 16 16"
                fill="none"
                style={{
                  animation: isSyncing ? "spin 0.8s linear infinite" : "none",
                  opacity: isSyncing ? 1 : 0.75,
                }}
              >
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.35)" strokeWidth="1.8" />
                <path d="M8 2a6 6 0 016 6" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              {isSyncing ? "Syncing…" : "Refresh"}
            </button>
          </div>
        </header>

        {/* ── Calendar Workspace ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <CalendarWorkspace initialEvents={events} />
        </div>
      </div>

      {/* ── Right Context Panel ── */}
      <RightPanel events={todayEvents} onOpenCalendar={() => {}} />
    </div>
  );
}

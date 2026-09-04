"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { ConnectIcon, SidebarToggleIcon, BackIcon } from "@/components/dashboard/icons";
import { ConnectWorkspace } from "@/components/connect";
import { useGmailThreads } from "@/hooks/use-gmail";

export default function ConnectPage() {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { threads } = useGmailThreads();

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
        activeNav="connect"
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        onSelectNav={(nav) => {
          if (nav === "inbox") {
            router.push("/dashboard/inbox");
          } else if (nav === "today" || nav === "upcoming") {
            router.push("/dashboard/calendar");
          } else if (nav === "connect") {
            // Already on connect
          } else {
            router.push("/dashboard");
          }
        }}
        onOpenCalendar={() => router.push("/dashboard/calendar")}
        onGoBack={() => router.push("/dashboard")}
        inboxBadge={unreadCount}
      />

      {/* ── Main Connect Area ── */}
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
        {/* Top Header Bar */}
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
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              title={sidebarCollapsed ? "Open primary sidebar" : "Collapse primary sidebar"}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                border: "1px solid #E4DED4",
                borderRadius: 6,
                padding: "4px 6px",
                cursor: "pointer",
                color: "#6B6762",
                transition: "background 0.12s, color 0.12s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#EEE9E1";
                e.currentTarget.style.color = "#1A1917";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#6B6762";
              }}
            >
              <SidebarToggleIcon size={14} />
            </button>

            <button
              onClick={() => router.push("/dashboard")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                background: "transparent",
                border: "none",
                padding: "4px 6px",
                cursor: "pointer",
                color: "#858079",
                fontSize: 12.5,
                fontWeight: 500,
                borderRadius: 6,
                transition: "color 0.12s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#1A1917")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#858079")}
            >
              <BackIcon size={12} />
              <span>Dashboard</span>
            </button>

            <span style={{ color: "#D1CBC1", fontSize: 13 }}>/</span>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "#5549C0", display: "flex" }}>
                <ConnectIcon size={14} />
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#1A1917" }}>
                Connect Apps & Mailboxes
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                fontSize: 11.5,
                color: "#16A34A",
                background: "#ECFDF5",
                border: "1px solid #BBF7D0",
                padding: "3px 10px",
                borderRadius: 20,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "#16A34A",
                }}
              />
              OAuth 2.0 Secure
            </span>
          </div>
        </header>

        {/* Content Workspace */}
        <ConnectWorkspace />
      </div>
    </div>
  );
}

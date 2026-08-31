"use client";

import React, { useRef, useEffect } from "react";
import { BellIcon } from "./icons";
import { Dot } from "./dot";
import { Avatar } from "./avatar";
import { View, Email, ServiceConnection, UserProfile } from "./types";
import { SERVICE_CONNECTIONS, CURRENT_USER } from "./mock-data";

export interface TopBarProps {
  view: View;
  selectedEmail: Email | null;
  statusOpen: boolean;
  onToggleStatus: () => void;
  onCloseStatus: () => void;
  connections?: ServiceConnection[];
  user?: UserProfile;
}

export function TopBar({
  view,
  selectedEmail,
  statusOpen,
  onToggleStatus,
  onCloseStatus,
  connections = SERVICE_CONNECTIONS,
  user = CURRENT_USER,
}: TopBarProps) {
  const statusMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        statusMenuRef.current &&
        !statusMenuRef.current.contains(event.target as Node)
      ) {
        onCloseStatus();
      }
    }

    if (statusOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [statusOpen, onCloseStatus]);

  const breadcrumbText = () => {
    if (view === "email" && selectedEmail) {
      return `${selectedEmail.from} · ${selectedEmail.subject}`;
    }
    if (view === "calendar") {
      return "Today's schedule";
    }
    return "Command Inbox";
  };

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        padding: "12px 28px",
        borderBottom: "1px solid #EAE6DE",
        background: "#FDFCF8",
        flexShrink: 0,
        gap: 10,
      }}
    >
      {/* Breadcrumb */}
      <div
        style={{
          flex: 1,
          fontSize: 12.5,
          color: "#B8B3AB",
          fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ color: view !== "default" ? "#7B7775" : "#B8B3AB" }}>
          {breadcrumbText()}
        </span>
      </div>

      {/* Connection Status Popover */}
      <div style={{ position: "relative" }} ref={statusMenuRef}>
        <button
          onClick={onToggleStatus}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 11.5,
            color: "#8BAE92",
            background: statusOpen ? "#EEE9E1" : "transparent",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
            padding: "4px 8px",
            borderRadius: 6,
            transition: "background 0.12s",
          }}
          onMouseEnter={(e) => {
            if (!statusOpen) e.currentTarget.style.background = "#EEE9E1";
          }}
          onMouseLeave={(e) => {
            if (!statusOpen) e.currentTarget.style.background = "transparent";
          }}
        >
          <Dot color="#8BAE92" size={5.5} /> Connected
        </button>

        {statusOpen && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 6px)",
              background: "#FFFFFF",
              border: "1px solid #E8E4DC",
              borderRadius: 10,
              padding: "12px 16px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.09)",
              minWidth: 160,
              zIndex: 30,
            }}
          >
            {connections.map(({ label, ok }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  fontSize: 12.5,
                  fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
                  color: "#2D2C2A",
                  padding: "4px 0",
                }}
              >
                <span>{label}</span>
                <span style={{ fontSize: 11.5, color: ok ? "#8BAE92" : "#C9826B" }}>
                  {ok ? "✓" : "✗"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notifications */}
      <button
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          border: "1px solid #E8E4DC",
          background: "transparent",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#7B7775",
          position: "relative",
          transition: "background 0.12s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#EEE9E1")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <BellIcon />
        <div
          style={{
            position: "absolute",
            top: 7,
            right: 7,
            width: 4.5,
            height: 4.5,
            borderRadius: "50%",
            background: "#5549C0",
            border: "1.5px solid #FDFCF8",
          }}
        />
      </button>

      {/* Header Avatar */}
      <Avatar initials={user.initials} color={user.color} size={32} />
    </header>
  );
}

"use client";

import React, { useState } from "react";
import {
  LogoIcon,
  InboxIcon,
  StarIcon,
  DraftIcon,
  SendIcon,
  CalendarIcon,
  UpcomingIcon,
  SearchIcon,
  CommandIcon,
  SettingsIcon,
  HelpIcon,
} from "./icons";
import { Avatar } from "./avatar";
import { UserProfile } from "./types";
import { CURRENT_USER } from "./mock-data";

export interface SidebarProps {
  activeNav: string;
  onSelectNav: (nav: string) => void;
  onOpenCalendar: () => void;
  onGoBack: () => void;
  user?: UserProfile;
}

function NavSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          fontSize: 9.5,
          fontWeight: 600,
          letterSpacing: "0.1em",
          color: "#B8B3AB",
          textTransform: "uppercase",
          padding: "0 10px",
          marginBottom: 3,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function NavBtn({
  icon: Icon,
  label,
  active,
  badge,
  onClick,
}: {
  icon: ({ className, size }: { className?: string; size?: number }) => React.JSX.Element;
  label: string;
  active?: boolean;
  badge?: number;
  onClick: () => void;
}) {
  const [hov, setHov] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6.5px 10px",
        borderRadius: 7,
        width: "100%",
        border: "none",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: active ? 500 : 400,
        fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
        color: active ? "#5549C0" : hov ? "#1A1917" : "#6B6762",
        background: active ? "#EAE8F8" : hov ? "#EEEBE4" : "transparent",
        transition: "background 0.12s, color 0.12s",
        textAlign: "left",
      }}
    >
      <span style={{ opacity: active ? 1 : 0.55, transition: "opacity 0.12s", display: "flex" }}>
        <Icon />
      </span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge != null && (
        <span
          style={{
            fontSize: 10.5,
            fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
            color: active ? "#5549C0" : "#A8A49E",
            background: active ? "#D8D5F5" : "#E8E4DC",
            padding: "1px 6px",
            borderRadius: 20,
            lineHeight: "16px",
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

export function Sidebar({
  activeNav,
  onSelectNav,
  onOpenCalendar,
  onGoBack,
  user = CURRENT_USER,
}: SidebarProps) {
  return (
    <aside
      style={{
        width: 196,
        flexShrink: 0,
        background: "#EEE9E1",
        borderRight: "1px solid #E4DED4",
        display: "flex",
        flexDirection: "column",
        padding: "0 10px 14px",
        overflowY: "auto",
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          padding: "20px 8px 28px",
        }}
      >
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 7,
            background: "linear-gradient(140deg, #5549C0 0%, #7B6ED8 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(85,73,192,0.3)",
            flexShrink: 0,
          }}
        >
          <LogoIcon />
        </div>
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#1A1917",
            letterSpacing: "-0.025em",
          }}
        >
          Command Inbox
        </span>
      </div>

      {/* Nav Menu */}
      <div style={{ flex: 1 }}>
        <NavSection title="Workspace">
          <NavBtn
            icon={InboxIcon}
            label="Inbox"
            active={activeNav === "inbox"}
            badge={12}
            onClick={() => {
              onSelectNav("inbox");
              onGoBack();
            }}
          />
          <NavBtn
            icon={StarIcon}
            label="Starred"
            active={activeNav === "starred"}
            onClick={() => {
              onSelectNav("starred");
              onGoBack();
            }}
          />
          <NavBtn
            icon={DraftIcon}
            label="Drafts"
            active={activeNav === "drafts"}
            onClick={() => {
              onSelectNav("drafts");
              onGoBack();
            }}
          />
          <NavBtn
            icon={SendIcon}
            label="Sent"
            active={activeNav === "sent"}
            onClick={() => {
              onSelectNav("sent");
              onGoBack();
            }}
          />
        </NavSection>

        <NavSection title="Schedule">
          <NavBtn
            icon={CalendarIcon}
            label="Today"
            active={activeNav === "today"}
            onClick={() => {
              onOpenCalendar();
            }}
          />
          <NavBtn
            icon={UpcomingIcon}
            label="Upcoming"
            active={activeNav === "upcoming"}
            onClick={() => {
              onSelectNav("upcoming");
            }}
          />
        </NavSection>

        <NavSection title="Tools">
          <NavBtn
            icon={SearchIcon}
            label="Search"
            active={activeNav === "search"}
            onClick={() => onSelectNav("search")}
          />
          <NavBtn
            icon={CommandIcon}
            label="Command"
            active={activeNav === "command"}
            onClick={() => onSelectNav("command")}
          />
        </NavSection>
      </div>

      {/* Footer Area */}
      <div style={{ borderTop: "1px solid #E4DED4", paddingTop: 10 }}>
        <NavBtn
          icon={SettingsIcon}
          label="Settings"
          active={false}
          onClick={() => {}}
        />
        <NavBtn
          icon={HelpIcon}
          label="Help"
          active={false}
          onClick={() => {}}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            padding: "10px 10px 2px",
            marginTop: 4,
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          <Avatar initials={user.initials} color={user.color} size={26} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 12.5,
                fontWeight: 500,
                color: "#1A1917",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.name}
            </div>
            <div
              style={{
                fontSize: 10.5,
                color: "#B8B3AB",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.email}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

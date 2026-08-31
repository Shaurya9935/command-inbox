"use client";

import React, { useState } from "react";
import { View, Email, CalendarEvent, UserProfile, ServiceConnection } from "./types";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { DefaultWorkspace } from "./default-workspace";
import { EmailThreadView } from "./email-thread-view";
import { CalendarView } from "./calendar-view";
import { RightPanel } from "./right-panel";
import {
  CURRENT_USER,
  EMAILS,
  EVENTS,
  FOCUS_ITEMS,
  SERVICE_CONNECTIONS,
} from "./mock-data";

export interface DashboardViewProps {
  initialUser?: UserProfile;
  initialEmails?: Email[];
  initialEvents?: CalendarEvent[];
  connections?: ServiceConnection[];
}

export function DashboardView({
  initialUser = CURRENT_USER,
  initialEmails = EMAILS,
  initialEvents = EVENTS,
  connections = SERVICE_CONNECTIONS,
}: DashboardViewProps) {
  const [activeNav, setActiveNav] = useState("inbox");
  const [view, setView] = useState<View>("default");
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [statusOpen, setStatusOpen] = useState(false);
  const [emails, setEmails] = useState<Email[]>(initialEmails);
  const [events] = useState<CalendarEvent[]>(initialEvents);

  const goBack = () => {
    setView("default");
    setSelectedEmail(null);
  };

  const openEmail = (e: Email) => {
    setSelectedEmail(e);
    setView("email");
    // Mark as read when opened
    setEmails((prev) =>
      prev.map((item) => (item.id === e.id ? { ...item, unread: false } : item))
    );
  };

  const openCalendar = () => {
    setActiveNav("today");
    setView("calendar");
  };

  const handleNavSelect = (nav: string) => {
    setActiveNav(nav);
    if (nav === "today") {
      setView("calendar");
    } else if (nav === "inbox" || nav === "starred" || nav === "drafts" || nav === "sent") {
      setView("default");
      setSelectedEmail(null);
    }
  };

  const handleSendCommand = (command: string) => {
    const lower = command.toLowerCase();
    if (lower.includes("calendar") || lower.includes("schedule") || lower.includes("meet")) {
      openCalendar();
    } else if (lower.includes("email") || lower.includes("unread") || lower.includes("reply")) {
      const firstUnread = emails.find((e) => e.unread) || emails[0];
      if (firstUnread) openEmail(firstUnread);
    }
  };

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
        activeNav={activeNav}
        onSelectNav={handleNavSelect}
        onOpenCalendar={openCalendar}
        onGoBack={goBack}
        user={initialUser}
      />

      {/* ── Center Area ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: "#F7F4EE",
          minWidth: 0,
        }}
      >
        {/* Top bar */}
        <TopBar
          view={view}
          selectedEmail={selectedEmail}
          statusOpen={statusOpen}
          onToggleStatus={() => setStatusOpen((prev) => !prev)}
          onCloseStatus={() => setStatusOpen(false)}
          connections={connections}
          user={initialUser}
        />

        {/* Dynamic Workspace Switcher */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {view === "email" && selectedEmail ? (
            <EmailThreadView email={selectedEmail} onBack={goBack} />
          ) : view === "calendar" ? (
            <CalendarView events={events} onBack={goBack} />
          ) : (
            <DefaultWorkspace
              onSelectEmail={openEmail}
              onSelectCalendar={openCalendar}
              onSelectInbox={() => {
                const first = emails[0];
                if (first) openEmail(first);
              }}
              onSendCommand={handleSendCommand}
              user={initialUser}
              focusItems={FOCUS_ITEMS}
              emails={emails}
            />
          )}
        </div>
      </div>

      {/* ── Right context panel ── */}
      <RightPanel
        events={events}
        onOpenCalendar={openCalendar}
        onOpenNextEvent={openCalendar}
      />
    </div>
  );
}

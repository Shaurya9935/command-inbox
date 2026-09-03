"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { View, Email, CalendarEvent, UserProfile, ServiceConnection, FocusItem } from "./types";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { DefaultWorkspace } from "./default-workspace";
import { EmailThreadView } from "./email-thread-view";
import { CalendarView } from "./calendar-view";
import { RightPanel } from "./right-panel";
import {
  CURRENT_USER,
  EVENTS,
  FOCUS_ITEMS,
  SERVICE_CONNECTIONS,
} from "./mock-data";
import { useGmailThreads, GmailThread } from "@/hooks/use-gmail";
import { useCalendarEvents } from "@/hooks/use-calendar";

export interface DashboardViewProps {
  initialUser?: UserProfile;
  initialEmails?: Email[];
  initialEvents?: CalendarEvent[];
  connections?: ServiceConnection[];
}

const PALETTE_COLORS = ["#8B72BE", "#5B8FAB", "#B07D4E", "#5549C0", "#3E7868", "#C5B49A"];

function formatSenderName(fromRaw: string): string {
  if (!fromRaw) return "Gmail User";
  const match = fromRaw.match(/^(.*?)\s*<.*?>$/);
  if (match && match[1]?.trim()) {
    return match[1].replace(/^["']|["']$/g, "").trim();
  }
  if (fromRaw.includes("@") && !fromRaw.includes(" ")) {
    return fromRaw.split("@")[0];
  }
  return fromRaw.trim();
}

function formatEmailTime(dateVal: string | Date | undefined): string {
  if (!dateVal) return "Recent";
  const date = new Date(dateVal);
  if (isNaN(date.getTime())) return "Recent";

  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  const isThisYear = date.getFullYear() === now.getFullYear();
  if (isThisYear) {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }

  return date.toLocaleDateString([], { month: "numeric", day: "numeric", year: "2-digit" });
}

function mapThreadToEmail(thread: GmailThread, index: number): Email {
  const data = thread?.data || thread || {};
  const id = thread?.entity_id || thread?.id || data?.id || `thread-${index}`;
  const snippet = data?.snippet || thread?.snippet || "";
  const rawFrom = data?.from || thread?.from || "Gmail User";
  const from = formatSenderName(rawFrom);
  const subject =
    data?.subject ||
    thread?.subject ||
    (snippet ? (snippet.length > 40 ? snippet.slice(0, 40) + "…" : snippet) : `Thread #${String(id).slice(0, 6)}`);
  const preview = snippet || data?.body || "No preview available";

  const initials =
    from
      .split(" ")
      .map((w: string) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "GM";

  const color = PALETTE_COLORS[index % PALETTE_COLORS.length];

  const dateVal =
    thread?.created_at ||
    thread?.updated_at ||
    thread?.createdAt ||
    data?.createdAt;
  const time = formatEmailTime(dateVal);

  const unread =
    thread?.unread !== undefined
      ? Boolean(thread.unread)
      : data?.unread !== undefined
      ? Boolean(data?.unread)
      : true;
  const tag = data?.tag || (unread ? "Needs reply" : "Inbox");

  const body = thread?.body || data?.body || "";
  const bodyHtml = thread?.bodyHtml || data?.bodyHtml || "";

  return {
    id,
    from,
    initials,
    color,
    subject,
    preview,
    time,
    unread,
    tag,
    body,
    bodyHtml,
  };
}

export function DashboardView({
  initialUser = CURRENT_USER,
  initialEmails = [],
  initialEvents = EVENTS,
  connections = SERVICE_CONNECTIONS,
}: DashboardViewProps) {
  const router = useRouter();
  const [view, setView] = useState<View>("default");
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [activeNav, setActiveNav] = useState("chat");
  const [statusOpen, setStatusOpen] = useState(false);
  const [readEmailIds, setReadEmailIds] = useState<Set<string | number>>(new Set());
  const [events] = useState<CalendarEvent[]>(initialEvents);

  // Fetch threads using the useGmailThreads hook
  const { threads, isLoading } = useGmailThreads();
  const { todayEvents, nextEvent: calendarNextEvent } = useCalendarEvents();

  // Map API threads to UI emails format, applying local read overrides
  const emails: Email[] = useMemo(() => {
    if (!Array.isArray(threads) || threads.length === 0) {
      return initialEmails;
    }
    return threads.map((thread, idx) => {
      const email = mapThreadToEmail(thread, idx);
      if (readEmailIds.has(email.id)) {
        return { ...email, unread: false };
      }
      return email;
    });
  }, [threads, initialEmails, readEmailIds]);

  const goBack = () => {
    setView("default");
    setSelectedEmail(null);
  };

  const openEmail = (e: Email) => {
    setSelectedEmail(e);
    setView("email");
    setReadEmailIds((prev) => new Set(prev).add(e.id));
  };

  const openCalendar = () => {
    setActiveNav("today");
    setView("calendar");
  };

  const handleNavSelect = (nav: string) => {
    setActiveNav(nav);
    if (nav === "today") {
      setView("calendar");
    } else if (nav === "inbox") {
      router.push("/dashboard/inbox");
    } else if (nav === "chat") {
      setView("default");
      setSelectedEmail(null);
    } else if (nav === "starred" || nav === "drafts" || nav === "sent") {
      setView("default");
      setSelectedEmail(null);
    }
  };

  const handleSendCommand = (command: string) => {
    const lower = command.toLowerCase();
    if (lower.includes("calendar") || lower.includes("schedule") || lower.includes("meet")) {
      openCalendar();
    } else if (lower.includes("email") || lower.includes("unread") || lower.includes("reply")) {
      router.push("/dashboard/inbox");
    }
  };

  const dynamicFocusItems: FocusItem[] = useMemo(() => {
    const unreadCount = emails.filter((e) => e.unread).length;
    const meetingCount = todayEvents.length;

    let nextMeetingStr = "24m";
    let nextMeetingLabel = "until Team sync";

    if (calendarNextEvent?.startIso) {
      const diffMin = Math.max(
        0,
        Math.round(
          (new Date(calendarNextEvent.startIso).getTime() - Date.now()) / 60000
        )
      );
      if (diffMin < 60) nextMeetingStr = `${diffMin}m`;
      else nextMeetingStr = `${Math.floor(diffMin / 60)}h`;
      nextMeetingLabel = `until ${calendarNextEvent.label}`;
    }

    return [
      {
        count: String(unreadCount || emails.length || 0),
        label: "emails need attention",
        action: "email",
      },
      {
        count: String(meetingCount),
        label: meetingCount === 1 ? "meeting today" : "meetings today",
        action: "calendar",
      },
      FOCUS_ITEMS[2] || { count: "2", label: "drafts waiting", action: "email" },
      {
        count: nextMeetingStr,
        label: nextMeetingLabel,
        action: "calendar",
      },
    ];
  }, [emails, todayEvents, calendarNextEvent]);

  const inboxBadgeCount = emails.filter((e) => e.unread).length || emails.length || 0;

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
        inboxBadge={inboxBadgeCount}
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
              onSelectInbox={() => router.push("/dashboard/inbox")}
              onSendCommand={handleSendCommand}
              user={initialUser}
              focusItems={dynamicFocusItems}
              emails={emails}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>

      {/* ── Right context panel ── */}
      <RightPanel
        events={todayEvents}
        onOpenCalendar={openCalendar}
        onOpenNextEvent={openCalendar}
      />
    </div>
  );
}

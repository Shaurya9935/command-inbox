"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGmailThreads, GmailThread } from "@/hooks/use-gmail";
import { Email } from "@/components/dashboard/types";
import { Avatar } from "@/components/dashboard/avatar";
import { Dot } from "@/components/dashboard/dot";
import { Sidebar } from "@/components/dashboard/sidebar";
import { EmailBodyContent } from "@/components/dashboard/email-body";
import {
  BackIcon,
  InboxIcon,
  StarIcon,
  DraftIcon,
  SendIcon,
  AllMailIcon,
  SpamIcon,
  TrashIcon,
  LabelIcon,
  SearchIcon,
  ReplyIcon,
  PaperclipIcon,
  SidebarToggleIcon,
} from "@/components/dashboard/icons";

const PALETTE_COLORS = [
  "#8B72BE",
  "#5B8FAB",
  "#B07D4E",
  "#5549C0",
  "#3E7868",
  "#C5B49A",
];

function formatSenderName(fromRaw: string): string {
  if (!fromRaw) return "Unknown sender";
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
  const rawFrom = data?.from || thread?.from || "";
  const from = formatSenderName(rawFrom);
  const subject =
    data?.subject ||
    thread?.subject ||
    (snippet
      ? snippet.length > 40
        ? snippet.slice(0, 40) + "…"
        : snippet
      : `Thread #${String(id).slice(0, 6)}`);
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
    data?.created_at ||
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

export default function InboxPage() {
  const router = useRouter();
  const [activeFolder, setActiveFolder] = useState("inbox");
  const [starredIds, setStarredIds] = useState<Set<string | number>>(new Set());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [secondaryOpen, setSecondaryOpen] = useState(true);
  const { threads, isLoading, isSyncing, error, lastSyncedAt, sync } = useGmailThreads();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [readIds, setReadIds] = useState<Set<string | number>>(new Set());
  const [replyText, setReplyText] = useState("");
  const [loadingBodyThreadId, setLoadingBodyThreadId] = useState<string | null>(null);
  const [fullBodies, setFullBodies] = useState<Record<string, { body?: string; bodyHtml?: string }>>({});

  const handleToggleStar = (e: React.MouseEvent, emailId: string | number) => {
    e.stopPropagation();
    setStarredIds((prev) => {
      const next = new Set(prev);
      if (next.has(emailId)) next.delete(emailId);
      else next.add(emailId);
      return next;
    });
  };

  // Map and filter emails
  const emails: Email[] = useMemo(() => {
    if (!Array.isArray(threads)) return [];
    return threads.map((thread, idx) => {
      const email = mapThreadToEmail(thread, idx);
      const isRead = readIds.has(email.id);
      const isStarred = starredIds.has(email.id);
      return {
        ...email,
        unread: isRead ? false : email.unread,
        starred: isStarred,
      };
    });
  }, [threads, readIds, starredIds]);

  const filteredEmails = useMemo(() => {
    let result = emails;

    // Filter by active folder
    if (activeFolder === "starred") {
      result = result.filter((e) => e.starred);
    } else if (activeFolder === "drafts") {
      result = result.filter((e) => e.tag?.toLowerCase().includes("draft"));
    } else if (activeFolder === "sent") {
      result = result.filter((e) => e.tag?.toLowerCase().includes("sent") || e.tag === "Needs reply");
    } else if (activeFolder === "spam") {
      result = result.filter((e) => e.tag?.toLowerCase().includes("spam"));
    } else if (activeFolder === "trash") {
      result = result.filter((e) => e.tag?.toLowerCase().includes("trash"));
    } else if (activeFolder.startsWith("label-")) {
      const labelName = activeFolder.replace("label-", "").toLowerCase();
      result = result.filter(
        (e) => e.tag?.toLowerCase().includes(labelName) || e.preview?.toLowerCase().includes(labelName)
      );
    }

    if (!searchQuery.trim()) return result;
    const q = searchQuery.toLowerCase();
    return result.filter(
      (e) =>
        e.from.toLowerCase().includes(q) ||
        e.subject.toLowerCase().includes(q) ||
        e.preview.toLowerCase().includes(q)
    );
  }, [emails, activeFolder, searchQuery]);

  // Selected email
  const selectedEmail = useMemo(() => {
    if (!selectedId) return filteredEmails[0] || null;
    return emails.find((e) => e.id === selectedId) || filteredEmails[0] || null;
  }, [emails, filteredEmails, selectedId]);

  useEffect(() => {
    if (!selectedEmail?.id) return;
    const idStr = String(selectedEmail.id);
    if (!idStr || idStr.startsWith("thread-")) return;

    if (selectedEmail.bodyHtml || fullBodies[idStr]?.bodyHtml) return;

    let isMounted = true;
    setLoadingBodyThreadId(idStr);

    fetch(`/api/gmail/threads/${idStr}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data) {
          setFullBodies((prev) => ({
            ...prev,
            [idStr]: {
              body: data.body,
              bodyHtml: data.bodyHtml,
            },
          }));
        }
      })
      .catch((err) => console.warn("Failed to fetch full thread body:", err))
      .finally(() => {
        if (isMounted) {
          setLoadingBodyThreadId((cur) => (cur === idStr ? null : cur));
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedEmail?.id, selectedEmail?.bodyHtml, fullBodies]);

  const handleSelect = (email: Email) => {
    setSelectedId(email.id);
    setReadIds((prev) => new Set(prev).add(email.id));
  };

  const handleSendReply = () => {
    if (replyText.trim()) {
      alert(`Reply sent: "${replyText.trim()}"`);
      setReplyText("");
    }
  };

  const unreadCount = emails.filter((e) => e.unread).length;

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
      {/* ── Sidebar (Collapsed 60px primary + 200px secondary Gmail sidebar) ── */}
      <Sidebar
        activeWorkspace="gmail"
        activeNav={activeFolder}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        secondaryOpen={secondaryOpen}
        onToggleSecondary={() => setSecondaryOpen((prev) => !prev)}
        onSelectNav={(nav) => {
          if (
            ["inbox", "starred", "drafts", "sent", "all-mail", "spam", "trash"].includes(nav) ||
            nav.startsWith("label-")
          ) {
            setActiveFolder(nav);
          } else if (nav === "calendar" || nav === "today" || nav === "upcoming") {
            router.push("/dashboard/calendar");
          } else {
            router.push("/dashboard");
          }
        }}
        onOpenCalendar={() => router.push("/dashboard/calendar")}
        onGoBack={() => router.push("/dashboard")}
        inboxBadge={unreadCount}
      />

      {/* ── Main Inbox Content Area ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          overflow: "hidden",
          background: "#F5F2EC",
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
            <div style={{ width: 1, height: 16, background: "#E8E4DC" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#5549C0", display: "flex" }}>
                {activeFolder === "starred" ? (
                  <StarIcon size={16} />
                ) : activeFolder === "drafts" ? (
                  <DraftIcon size={16} />
                ) : activeFolder === "sent" ? (
                  <SendIcon size={16} />
                ) : activeFolder === "all-mail" ? (
                  <AllMailIcon size={16} />
                ) : activeFolder === "trash" ? (
                  <TrashIcon size={16} />
                ) : activeFolder === "spam" ? (
                  <SpamIcon size={16} />
                ) : activeFolder.startsWith("label-") ? (
                  <LabelIcon size={16} />
                ) : (
                  <InboxIcon size={16} />
                )}
              </span>
              <h1
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#1A1917",
                  margin: 0,
                  letterSpacing: "-0.02em",
                  textTransform: "capitalize",
                }}
              >
                {activeFolder.startsWith("label-")
                  ? `Label: ${activeFolder.replace("label-", "")}`
                  : activeFolder === "all-mail"
                  ? "All Mail"
                  : activeFolder}
              </h1>
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                  color: unreadCount > 0 ? "#5549C0" : "#9B9691",
                  background: unreadCount > 0 ? "#EAE8F8" : "#E8E4DC",
                  padding: "2px 7px",
                  borderRadius: 12,
                  fontWeight: 500,
                }}
              >
                {unreadCount} unread
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
              width: 260,
            }}
          >
            <span style={{ color: "#A8A49E", display: "flex" }}>
              <SearchIcon size={13} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages…"
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
            title="Fetch latest emails from Gmail"
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
            {/* Spinner SVG shown while syncing */}
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
              <circle
                cx="8" cy="8" r="6"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="1.8"
              />
              <path
                d="M8 2a6 6 0 016 6"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            {isSyncing ? "Syncing…" : "Refresh"}
          </button>
        </div>
      </header>

      {/* ── Error Banner if any ── */}
      {error && (
        <div
          style={{
            padding: "10px 28px",
            background: "#FDF2F2",
            borderBottom: "1px solid #F8D7DA",
            color: "#C53030",
            fontSize: 12.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>Error loading emails: {error}</span>
          <button
            onClick={() => sync()}
            style={{
              background: "none",
              border: "none",
              color: "#9B2C2C",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 12,
              textDecoration: "underline",
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Main Two-Pane Container ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          overflow: "hidden",
        }}
      >
        {/* Left Pane: Email Thread List */}
        <div
          style={{
            width: 380,
            flexShrink: 0,
            borderRight: "1px solid #E8E4DC",
            background: "#FAF8F4",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
          }}
        >
          {isLoading && emails.length === 0 ? (
            <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  style={{
                    display: "flex",
                    gap: 12,
                    opacity: 0.5,
                    animation: "fade-in 1s infinite alternate",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: "#E8E4DC",
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ width: "45%", height: 12, background: "#E8E4DC", borderRadius: 4 }} />
                    <div style={{ width: "80%", height: 10, background: "#EDEAE4", borderRadius: 4 }} />
                    <div style={{ width: "60%", height: 9, background: "#F0EDE7", borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredEmails.length === 0 ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "36px 24px",
                textAlign: "center",
                color: "#9B9691",
              }}
            >
              <InboxIcon size={32} />
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#1A1917",
                  margin: "12px 0 4px",
                }}
              >
                No messages found
              </p>
              <p style={{ fontSize: 12.5, margin: 0 }}>
                {searchQuery ? "No matches for your search" : "Your inbox is completely caught up"}
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {filteredEmails.map((email) => {
                const isSelected = selectedEmail?.id === email.id;
                return (
                  <button
                    key={email.id}
                    onClick={() => handleSelect(email)}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      padding: "16px 20px",
                      background: isSelected ? "#FFFFFF" : "transparent",
                      border: "none",
                      borderBottom: "1px solid #EDEAE4",
                      borderLeft: isSelected ? "3px solid #5549C0" : "3px solid transparent",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background 0.12s",
                      boxShadow: isSelected ? "0 2px 8px rgba(0,0,0,0.03)" : "none",
                    }}
                  >
                    <Avatar
                      initials={email.initials}
                      color={email.color}
                      size={34}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          marginBottom: 3,
                        }}
                      >
                        {email.unread && <Dot color="#5549C0" size={5} />}
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: email.unread ? 600 : 500,
                            color: isSelected ? "#5549C0" : "#1A1917",
                            flex: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {email.from}
                        </span>
                        <span
                          style={{
                            fontSize: 10.5,
                            fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                            color: "#B8B3AB",
                            flexShrink: 0,
                          }}
                        >
                          {email.time}
                        </span>
                        <button
                          onClick={(e) => handleToggleStar(e, email.id)}
                          title={email.starred ? "Starred" : "Not starred"}
                          style={{
                            background: "none",
                            border: "none",
                            padding: "0 2px",
                            cursor: "pointer",
                            color: email.starred ? "#F59E0B" : "#C5C0B9",
                            display: "flex",
                            alignItems: "center",
                            flexShrink: 0,
                          }}
                        >
                          <StarIcon size={12} />
                        </button>
                      </div>
                      <div
                        style={{
                          fontSize: 12.5,
                          fontWeight: email.unread ? 600 : 400,
                          color: "#3D3C3A",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          marginBottom: 2,
                        }}
                      >
                        {email.subject}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#9B9691",
                          fontFamily: "var(--font-body, 'Inter', system-ui, sans-serif)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {email.preview}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Pane: Reading & Replying View */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            background: "#F7F4EE",
            overflowY: "auto",
            padding: "36px 48px",
          }}
        >
          {selectedEmail ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                maxWidth: 720,
                width: "100%",
                margin: "0 auto",
                animation: "fadeSlideIn 0.2s ease",
              }}
            >
              {/* Header */}
              <div style={{ marginBottom: 24 }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "3px 9px",
                    borderRadius: 6,
                    background: "#EAE8F8",
                    color: "#5549C0",
                    fontSize: 11.5,
                    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                    marginBottom: 12,
                  }}
                >
                  <Dot color="#5549C0" size={5} />
                  <span>{selectedEmail.tag}</span>
                </div>
                <h2
                  style={{
                    fontSize: 22,
                    fontWeight: 600,
                    color: "#1A1917",
                    letterSpacing: "-0.03em",
                    margin: 0,
                    lineHeight: 1.3,
                  }}
                >
                  {selectedEmail.subject}
                </h2>
              </div>

              {/* Message Body Card */}
              <div
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E8E4DC",
                  borderRadius: 12,
                  padding: "24px 28px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 20,
                  }}
                >
                  <Avatar
                    initials={selectedEmail.initials}
                    color={selectedEmail.color}
                    size={38}
                  />
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#1A1917",
                      }}
                    >
                      {selectedEmail.from}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#9B9691",
                        fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                        marginTop: 1,
                      }}
                    >
                      to me · {selectedEmail.time}
                    </div>
                  </div>
                </div>

                <EmailBodyContent
                  body={fullBodies[String(selectedEmail.id)]?.body || selectedEmail.body}
                  bodyHtml={fullBodies[String(selectedEmail.id)]?.bodyHtml || selectedEmail.bodyHtml}
                  preview={selectedEmail.preview}
                  isLoading={
                    loadingBodyThreadId === String(selectedEmail.id) &&
                    !selectedEmail.bodyHtml &&
                    !selectedEmail.body
                  }
                />
              </div>

              {/* Reply Composer */}
              <div
                style={{
                  background: "#FDFCF9",
                  border: "1px solid #E8E4DC",
                  borderRadius: 12,
                  padding: "16px 20px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: "#9B9691",
                    marginBottom: 10,
                  }}
                >
                  Reply to {selectedEmail.from}
                </div>
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type a message or draft instructions…"
                  style={{
                    width: "100%",
                    border: "none",
                    background: "transparent",
                    outline: "none",
                    resize: "none",
                    fontSize: 13.5,
                    fontFamily: "var(--font-body, 'Inter', system-ui, sans-serif)",
                    color: "#1A1917",
                    lineHeight: 1.6,
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 12,
                    paddingTop: 12,
                    borderTop: "1px solid #EDEAE4",
                  }}
                >
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: 12,
                        color: "#7B7775",
                        background: "transparent",
                        border: "1px solid #E4E0D8",
                        borderRadius: 7,
                        padding: "5px 11px",
                        cursor: "pointer",
                        transition: "all 0.12s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#F5F2EC";
                        e.currentTarget.style.color = "#1A1917";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "#7B7775";
                      }}
                    >
                      <ReplyIcon />
                      <span>Reply</span>
                    </button>
                    <button
                      type="button"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: 12,
                        color: "#7B7775",
                        background: "transparent",
                        border: "1px solid #E4E0D8",
                        borderRadius: 7,
                        padding: "5px 11px",
                        cursor: "pointer",
                        transition: "all 0.12s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#F5F2EC";
                        e.currentTarget.style.color = "#1A1917";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "#7B7775";
                      }}
                    >
                      <PaperclipIcon />
                      <span>Attach</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleSendReply}
                    disabled={!replyText.trim()}
                    style={{
                      fontSize: 12.5,
                      fontWeight: 500,
                      color: "#FFF",
                      background: replyText.trim() ? "#5549C0" : "#A8A49E",
                      border: "none",
                      borderRadius: 8,
                      padding: "7px 16px",
                      cursor: replyText.trim() ? "pointer" : "default",
                      transition: "opacity 0.12s, background 0.12s",
                    }}
                    onMouseEnter={(e) => {
                      if (replyText.trim()) e.currentTarget.style.opacity = "0.88";
                    }}
                    onMouseLeave={(e) => {
                      if (replyText.trim()) e.currentTarget.style.opacity = "1";
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "#A8A49E",
                textAlign: "center",
              }}
            >
              <InboxIcon size={36} />
              <p style={{ margin: "14px 0 0", fontSize: 14 }}>
                Select a thread from the list to view its contents
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);
}

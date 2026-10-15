"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useStarredThreads } from "@/hooks/use-gmail";
import { Email } from "@/components/dashboard/types";
import { Avatar } from "@/components/dashboard/avatar";
import { Dot } from "@/components/dashboard/dot";
import { EmailBodyContent } from "@/components/inbox/email-body";
import { EmailListItem } from "@/components/inbox/email-list-item";
import { mapThreadToEmail } from "@/components/inbox/email-utils";
import {
  StarIcon,
  SearchIcon,
  ReplyIcon,
  PaperclipIcon,
  SidebarToggleIcon,
} from "@/components/dashboard/icons";

export interface StarredViewProps {
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export function StarredView({
  sidebarCollapsed = false,
  onToggleSidebar,
}: StarredViewProps) {
  const {
    threads,
    isLoading,
    isRefreshing,
    error,
    hasMore,
    loadMore,
    refresh,
    unstar,
    isStale,
  } = useStarredThreads();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [readIds, setReadIds] = useState<Set<string | number>>(new Set());
  const [fadingIds, setFadingIds] = useState<Set<string | number>>(new Set());
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "error" | "info" | "success" } | null>(null);

  const showToast = (message: string, type: "error" | "info" | "success" = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const [replyText, setReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [fullBodies, setFullBodies] = useState<
    Record<string, { body?: string; bodyHtml?: string }>
  >({});
  const [failedBodyThreadIds, setFailedBodyThreadIds] = useState<Set<string>>(
    new Set()
  );
  const inFlightRef = useRef<Set<string>>(new Set());
  const fetchedThreadIdsRef = useRef<Set<string>>(new Set());

  // Map threads to Email objects
  const emails: Email[] = useMemo(() => {
    if (!Array.isArray(threads)) return [];
    return threads.map((thread, idx) => {
      const email = mapThreadToEmail(thread, idx);
      const isRead = readIds.has(email.id);
      return {
        ...email,
        unread: isRead ? false : email.unread,
        starred: true,
      };
    });
  }, [threads, readIds]);

  // Filter by search query
  const filteredEmails = useMemo(() => {
    if (!searchQuery.trim()) return emails;
    const q = searchQuery.toLowerCase();
    return emails.filter(
      (e) =>
        e.from.toLowerCase().includes(q) ||
        e.subject.toLowerCase().includes(q) ||
        e.preview.toLowerCase().includes(q)
    );
  }, [emails, searchQuery]);

  // Selected email
  const selectedEmail = useMemo(() => {
    if (!filteredEmails.length) return null;
    if (!selectedId) return filteredEmails[0] || null;
    return filteredEmails.find((e) => e.id === selectedId) || filteredEmails[0] || null;
  }, [filteredEmails, selectedId]);

  const selectedEmailIdStr = selectedEmail?.id ? String(selectedEmail.id) : null;
  const isRealThread = Boolean(
    selectedEmailIdStr && !selectedEmailIdStr.startsWith("thread-")
  );
  const cachedFullBody = selectedEmailIdStr
    ? fullBodies[selectedEmailIdStr]
    : undefined;
  const hasSelectedBody = Boolean(
    selectedEmail?.bodyHtml ||
      selectedEmail?.body ||
      cachedFullBody?.bodyHtml ||
      cachedFullBody?.body
  );

  const isSelectedBodyLoading = Boolean(
    isRealThread &&
      !hasSelectedBody &&
      selectedEmailIdStr &&
      !failedBodyThreadIds.has(selectedEmailIdStr)
  );

  // Fetch full thread body on demand if needed
  useEffect(() => {
    if (!selectedEmail?.id) return;
    const idStr = String(selectedEmail.id);
    if (!idStr || idStr.startsWith("thread-")) return;

    if (
      selectedEmail.bodyHtml ||
      selectedEmail.body ||
      fullBodies[idStr] !== undefined ||
      fetchedThreadIdsRef.current.has(idStr) ||
      failedBodyThreadIds.has(idStr) ||
      inFlightRef.current.has(idStr)
    ) {
      return;
    }

    let isMounted = true;
    inFlightRef.current.add(idStr);
    fetchedThreadIdsRef.current.add(idStr);

    fetch(`/api/gmail/threads/${idStr}`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch thread: HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (isMounted && data) {
          setFullBodies((prev) => ({
            ...prev,
            [idStr]: {
              body: data.body || "",
              bodyHtml: data.bodyHtml || "",
            },
          }));
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch full thread body:", err);
        if (isMounted) {
          setFailedBodyThreadIds((prev) => new Set(prev).add(idStr));
        }
      })
      .finally(() => {
        inFlightRef.current.delete(idStr);
      });

    return () => {
      isMounted = false;
    };
  }, [
    selectedEmail?.id,
    selectedEmail?.bodyHtml,
    selectedEmail?.body,
    fullBodies,
    failedBodyThreadIds,
  ]);

  const handleSelect = (email: Email) => {
    setSelectedId(email.id);
    setReadIds((prev) => new Set(prev).add(email.id));
    setReplyError(null);
  };

  const handleUnstar = (e: React.MouseEvent, emailId: string | number) => {
    e.stopPropagation();

    // Start fade-out animation
    setFadingIds((prev) => new Set(prev).add(emailId));

    // Determine the next thread to select if the unstarred thread is currently open
    if (selectedEmail && selectedEmail.id === emailId) {
      const currentIndex = filteredEmails.findIndex((m) => m.id === emailId);
      const remainingEmails = filteredEmails.filter((m) => m.id !== emailId);
      if (remainingEmails.length > 0) {
        const nextEmail =
          remainingEmails[currentIndex] ||
          remainingEmails[currentIndex - 1] ||
          remainingEmails[0];
        setSelectedId(nextEmail.id);
      } else {
        setSelectedId(null);
      }
    }

    // Call unstar with a brief timeout so the fade-out is visible
    setTimeout(() => {
      unstar(emailId)
        .then((ok) => {
          if (!ok) {
            setFadingIds((prev) => {
              const next = new Set(prev);
              next.delete(emailId);
              return next;
            });
            showToast("Failed to unstar message. Restored to list.", "error");
          }
        })
        .catch((err) => {
          setFadingIds((prev) => {
            const next = new Set(prev);
            next.delete(emailId);
            return next;
          });
          showToast(err instanceof Error ? err.message : "Failed to unstar message. Restored to list.", "error");
        });
    }, 200);
  };

  const handleLoadMore = async () => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      await loadMore();
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedEmail || isSendingReply) return;

    setIsSendingReply(true);
    setReplyError(null);

    try {
      const emailIdStr = String(selectedEmail.id);
      const isReal = !emailIdStr.startsWith("thread-");

      const currentThread = threads.find(
        (t) => (t.entity_id || t.id || t.data?.id) === selectedEmail.id
      );
      const rawFrom = currentThread?.data?.from || currentThread?.from;

      const res = await fetch("/api/gmail/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId: isReal ? emailIdStr : undefined,
          to: rawFrom || selectedEmail.from,
          subject: selectedEmail.subject
            ? selectedEmail.subject.toLowerCase().startsWith("re:")
              ? selectedEmail.subject
              : `Re: ${selectedEmail.subject}`
            : undefined,
          body: replyText.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Send failed (${res.status})`);
      }

      setReplyText("");
      refresh().catch(() => {});
    } catch (err) {
      console.error("Failed to send reply:", err);
      setReplyError(err instanceof Error ? err.message : "Failed to send reply");
    } finally {
      setIsSendingReply(false);
    }
  };

  const starredCount = filteredEmails.length;

  return (
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
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
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
          )}
          {onToggleSidebar && (
            <div style={{ width: 1, height: 16, background: "#E8E4DC" }} />
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#F59E0B", display: "flex" }}>
              <StarIcon size={16} />
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
              Starred
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
              {starredCount} starred
            </span>
          </div>
        </div>

        {/* Search, Stale Indicator & Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Stale status banner */}
          {isStale && (
            <span
              style={{
                fontSize: 11.5,
                color: "#9B9691",
                background: "#EDEAE4",
                padding: "3px 8px",
                borderRadius: 6,
                fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
              title="Gmail API could not be reached; showing cached results."
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#B8B3AB",
                }}
              />
              Showing saved results
            </span>
          )}

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

          {/* Sync / Refresh button */}
          <button
            onClick={() => refresh()}
            disabled={isRefreshing}
            title="Fetch latest starred emails from Gmail"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              background: isRefreshing ? "#7B6ED8" : "#5549C0",
              color: "#FFFFFF",
              border: "none",
              borderRadius: 8,
              fontSize: 12.5,
              fontWeight: 500,
              cursor: isRefreshing ? "default" : "pointer",
              opacity: isRefreshing ? 0.85 : 1,
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
                animation: isRefreshing ? "spin 0.8s linear infinite" : "none",
                opacity: isRefreshing ? 1 : 0.75,
              }}
            >
              <circle
                cx="8"
                cy="8"
                r="6"
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
            {isRefreshing ? "Syncing…" : "Refresh"}
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
          <span>Error loading starred messages: {error}</span>
          <button
            onClick={() => refresh()}
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
        {/* Left Pane: Starred Thread List */}
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
            <div
              style={{
                padding: "24px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  style={{
                    display: "flex",
                    gap: 12,
                    opacity: 0.5,
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
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        width: "45%",
                        height: 12,
                        background: "#E8E4DC",
                        borderRadius: 4,
                      }}
                    />
                    <div
                      style={{
                        width: "80%",
                        height: 10,
                        background: "#EDEAE4",
                        borderRadius: 4,
                      }}
                    />
                    <div
                      style={{
                        width: "60%",
                        height: 9,
                        background: "#F0EDE7",
                        borderRadius: 4,
                      }}
                    />
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
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "#EDE8DF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#A8A49E",
                  marginBottom: 12,
                }}
              >
                <StarIcon size={24} />
              </div>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#1A1917",
                  margin: "0 0 4px",
                }}
              >
                {searchQuery ? "No matches found" : "No starred messages"}
              </p>
              <p
                style={{
                  fontSize: 12.5,
                  margin: 0,
                  maxWidth: 240,
                  lineHeight: 1.5,
                }}
              >
                {searchQuery
                  ? "Try searching for a different sender or keyword"
                  : "Star important emails and they'll show up here."}
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {filteredEmails.map((email) => {
                const isSelected = selectedEmail?.id === email.id;
                const isFading = fadingIds.has(email.id);
                return (
                  <EmailListItem
                    key={email.id}
                    email={email}
                    isSelected={isSelected}
                    onSelect={handleSelect}
                    onToggleStar={handleUnstar}
                    fadingOut={isFading}
                  />
                );
              })}

              {/* Load More Button */}
              {hasMore && (
                <div style={{ padding: "16px 20px", textAlign: "center" }}>
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    style={{
                      width: "100%",
                      padding: "8px 14px",
                      background: "#FFFFFF",
                      border: "1px solid #E4E0D8",
                      borderRadius: 8,
                      fontSize: 12.5,
                      fontWeight: 500,
                      color: "#5549C0",
                      cursor: isLoadingMore ? "default" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
                      transition: "background 0.12s",
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoadingMore) e.currentTarget.style.background = "#F5F2EC";
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoadingMore) e.currentTarget.style.background = "#FFFFFF";
                    }}
                  >
                    {isLoadingMore ? "Loading more…" : "Load more starred messages"}
                  </button>
                </div>
              )}
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
                  <span>Starred</span>
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
                  body={
                    fullBodies[String(selectedEmail.id)]?.body ||
                    selectedEmail.body
                  }
                  bodyHtml={
                    fullBodies[String(selectedEmail.id)]?.bodyHtml ||
                    selectedEmail.bodyHtml
                  }
                  preview={selectedEmail.preview}
                  isLoading={isSelectedBodyLoading}
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
                {replyError && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "#DC2626",
                      background: "#FEF2F2",
                      border: "1px solid #FCA5A5",
                      borderRadius: 6,
                      padding: "6px 10px",
                      marginTop: 8,
                    }}
                  >
                    {replyError}
                  </div>
                )}
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
                    disabled={!replyText.trim() || isSendingReply}
                    style={{
                      fontSize: 12.5,
                      fontWeight: 500,
                      color: "#FFF",
                      background:
                        replyText.trim() && !isSendingReply
                          ? "#5549C0"
                          : "#A8A49E",
                      border: "none",
                      borderRadius: 8,
                      padding: "7px 16px",
                      cursor:
                        replyText.trim() && !isSendingReply
                          ? "pointer"
                          : "default",
                      transition: "opacity 0.12s, background 0.12s",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                    onMouseEnter={(e) => {
                      if (replyText.trim() && !isSendingReply)
                        e.currentTarget.style.opacity = "0.88";
                    }}
                    onMouseLeave={(e) => {
                      if (replyText.trim() && !isSendingReply)
                        e.currentTarget.style.opacity = "1";
                    }}
                  >
                    {isSendingReply ? (
                      <>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 16 16"
                          fill="none"
                          style={{ animation: "spin 0.8s linear infinite" }}
                        >
                          <circle
                            cx="8"
                            cy="8"
                            r="6"
                            stroke="rgba(255,255,255,0.4)"
                            strokeWidth="2.5"
                          />
                          <path
                            d="M8 2a6 6 0 016 6"
                            stroke="#FFF"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                        </svg>
                        <span>Sending…</span>
                      </>
                    ) : (
                      "Send"
                    )}
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
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: "#EDE8DF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#B8B3AB",
                  marginBottom: 14,
                }}
              >
                <StarIcon size={26} />
              </div>
              <p style={{ margin: 0, fontSize: 14, color: "#6B6762" }}>
                Select a starred thread from the list to view its contents
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Toast Notification ── */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 28,
            right: 28,
            zIndex: 200,
            background: toast.type === "error" ? "#EF4444" : toast.type === "info" ? "#3B82F6" : "#1A1917",
            color: "#FFFFFF",
            padding: "11px 18px",
            borderRadius: 10,
            boxShadow: "0 10px 25px rgba(0,0,0,0.18)",
            display: "flex",
            alignItems: "center",
            gap: 9,
            fontSize: 13,
            fontWeight: 500,
            animation: "toastIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {toast.type === "error" && (
            <svg width={15} height={15} viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="#FFFFFF" strokeWidth="1.5" />
              <path d="M8 5v3.5M8 11h.01" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}
          <span>{toast.message}</span>
        </div>
      )}

      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

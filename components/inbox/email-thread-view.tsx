"use client";

import React, { useState, useEffect, useRef } from "react";
import { Email } from "../dashboard/types";
import { Avatar } from "../dashboard/avatar";
import { BackIcon, ReplyIcon, PaperclipIcon } from "../dashboard/icons";
import { EmailBodyContent } from "./email-body";

export interface EmailThreadViewProps {
  email: Email;
  onBack: () => void;
  onSendReply?: (replyText: string) => void;
}

export function EmailThreadView({
  email,
  onBack,
  onSendReply,
}: EmailThreadViewProps) {
  const [replyText, setReplyText] = useState("");
  const [fetchedData, setFetchedData] = useState<{ body?: string; bodyHtml?: string } | null>(null);
  const [fetchFailed, setFetchFailed] = useState<boolean>(false);
  const [prevEmailId, setPrevEmailId] = useState(email.id);
  const inFlightRef = useRef<string | null>(null);
  const fetchedThreadIdsRef = useRef<Set<string>>(new Set());

  if (email.id !== prevEmailId) {
    setPrevEmailId(email.id);
    setFetchFailed(false);
    setFetchedData(null);
  }

  const isRealThread = Boolean(email.id && !String(email.id).startsWith("thread-"));
  const hasBody = Boolean(email.bodyHtml || email.body || fetchedData?.bodyHtml || fetchedData?.body);
  const isLoadingBody = isRealThread && !hasBody && !fetchFailed;

  useEffect(() => {
    if (!email.id) return;
    const idStr = String(email.id);
    if (!idStr || idStr.startsWith("thread-")) return;

    // Do not fetch if the body is already present on the email object,
    // already fetched, marked as failed, or currently in-flight.
    if (
      email.bodyHtml ||
      email.body ||
      fetchedData !== null ||
      fetchedThreadIdsRef.current.has(idStr) ||
      fetchFailed ||
      inFlightRef.current === idStr
    ) {
      return;
    }

    let isMounted = true;
    inFlightRef.current = idStr;
    fetchedThreadIdsRef.current.add(idStr);

    fetch(`/api/gmail/threads/${idStr}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (isMounted && data) {
          setFetchedData({
            body: data.body || "",
            bodyHtml: data.bodyHtml || "",
          });
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch full thread:", err);
        if (isMounted) setFetchFailed(true);
      })
      .finally(() => {
        if (inFlightRef.current === idStr) {
          inFlightRef.current = null;
        }
      });

    return () => {
      isMounted = false;
    };
  }, [email.id, email.bodyHtml, email.body, fetchedData, fetchFailed]);

  const handleSend = () => {
    if (replyText.trim()) {
      if (onSendReply) {
        onSendReply(replyText.trim());
      }
      setReplyText("");
    }
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "36px 48px",
        overflowY: "auto",
        animation: "fadeSlideIn 0.2s ease",
      }}
    >
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12.5,
          color: "var(--text-muted)",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          marginBottom: 28,
          width: "fit-content",
          fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
          transition: "color 0.12s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-text)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
      >
        <BackIcon />
        <span>Back to workspace</span>
      </button>

      {/* Thread header */}
      <h2
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: "var(--text-primary)",
          letterSpacing: "-0.03em",
          margin: "0 0 20px",
          fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
        }}
      >
        {email.subject}
      </h2>

      {/* Message Card */}
      <div
        style={{
          background: "var(--surface-card)",
          border: "1px solid var(--border-hairline)",
          borderRadius: 12,
          padding: "24px 28px",
          boxShadow: "0 1px 4px var(--shadow-color)",
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
          <Avatar initials={email.initials} color={email.color} size={36} />
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--text-primary)",
                fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
              }}
            >
              {email.from}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                marginTop: 1,
              }}
            >
              to me · {email.time}
            </div>
          </div>
        </div>

        <EmailBodyContent
          body={fetchedData?.body || email.body}
          bodyHtml={fetchedData?.bodyHtml || email.bodyHtml}
          preview={email.preview}
          isLoading={isLoadingBody && !email.bodyHtml && !email.body}
        />
      </div>

      {/* Reply composer */}
      <div
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-hairline)",
          borderRadius: 12,
          padding: "16px 20px",
          boxShadow: "0 1px 4px var(--shadow-color)",
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: "var(--text-muted)",
            marginBottom: 10,
            fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
          }}
        >
          Reply to {email.from}
        </div>
        <textarea
          rows={3}
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Write your reply…"
          style={{
            width: "100%",
            border: "none",
            background: "transparent",
            outline: "none",
            resize: "none",
            fontSize: 13.5,
            fontFamily: "var(--font-body, 'Inter', system-ui, sans-serif)",
            color: "var(--text-primary)",
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
            borderTop: "1px solid var(--border-hairline)",
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
                color: "var(--text-secondary)",
                background: "transparent",
                border: "1px solid var(--border-hairline)",
                borderRadius: 7,
                padding: "5px 11px",
                cursor: "pointer",
                fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
                transition: "all 0.12s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--hover)";
                e.currentTarget.style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--text-secondary)";
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
                color: "var(--text-secondary)",
                background: "transparent",
                border: "1px solid var(--border-hairline)",
                borderRadius: 7,
                padding: "5px 11px",
                cursor: "pointer",
                fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
                transition: "all 0.12s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--hover)";
                e.currentTarget.style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              <PaperclipIcon />
              <span>Attach</span>
            </button>
          </div>
          <button
            type="button"
            onClick={handleSend}
            style={{
              fontSize: 12.5,
              fontWeight: 500,
              color: "var(--on-accent)",
              background: "var(--accent-solid)",
              border: "none",
              borderRadius: 8,
              padding: "7px 16px",
              cursor: "pointer",
              fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
              transition: "opacity 0.12s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
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
  const [isLoadingBody, setIsLoadingBody] = useState<boolean>(false);
  const firstName = email.from.split(" ")[0];

  useEffect(() => {
    if (!email.id || email.bodyHtml) return;
    const idStr = String(email.id);
    if (!idStr || idStr.startsWith("thread-")) return;

    let isMounted = true;
    setIsLoadingBody(true);

    fetch(`/api/gmail/threads/${idStr}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data) {
          setFetchedData({
            body: data.body,
            bodyHtml: data.bodyHtml,
          });
        }
      })
      .catch((err) => console.warn("Failed to fetch full thread:", err))
      .finally(() => {
        if (isMounted) setIsLoadingBody(false);
      });

    return () => {
      isMounted = false;
    };
  }, [email.id, email.bodyHtml]);

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
          color: "#9B9691",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          marginBottom: 28,
          width: "fit-content",
          fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
          transition: "color 0.12s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#5549C0")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#9B9691")}
      >
        <BackIcon />
        <span>Back to workspace</span>
      </button>

      {/* Thread header */}
      <h2
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: "#1A1917",
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
          <Avatar initials={email.initials} color={email.color} size={36} />
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#1A1917",
                fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
              }}
            >
              {email.from}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#9B9691",
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
                fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
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
                fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
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
            onClick={handleSend}
            style={{
              fontSize: 12.5,
              fontWeight: 500,
              color: "#FFF",
              background: "#5549C0",
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

"use client";

import React, { useState } from "react";
import { Email } from "./types";
import { Avatar } from "./avatar";
import { BackIcon, ReplyIcon, PaperclipIcon } from "./icons";

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
  const firstName = email.from.split(" ")[0];

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
        <div
          style={{
            fontSize: 14,
            color: "#2D2C2A",
            fontFamily: "var(--font-body, 'Inter', system-ui, sans-serif)",
            lineHeight: 1.7,
          }}
        >
          {email.preview}
          <br />
          <br />
          Let me know what you think — happy to jump on a quick call if that&apos;s
          easier.
          <br />
          <br />
          Best,
          <br />
          {firstName}
        </div>
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

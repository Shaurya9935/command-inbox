"use client";

import React from "react";
import { Email } from "./types";
import { EMAILS } from "./mock-data";
import { Avatar } from "./avatar";
import { Dot } from "./dot";
import { ArrowRightIcon } from "./icons";

export interface NeedsAttentionProps {
  emails?: Email[];
  onSelectEmail: (email: Email) => void;
  onViewInbox: () => void;
  className?: string;
}

export function NeedsAttention({
  emails = EMAILS,
  onSelectEmail,
  onViewInbox,
  className = "",
}: NeedsAttentionProps) {
  return (
    <div className={className}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <div
          style={{
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: "0.09em",
            color: "#B8B3AB",
            textTransform: "uppercase",
          }}
        >
          Needs attention
        </div>
        <button
          type="button"
          onClick={onViewInbox}
          style={{
            fontSize: 12,
            color: "#A8A49E",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: 0,
            transition: "color 0.12s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#5549C0")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#A8A49E")}
        >
          <span>View inbox</span>
          <ArrowRightIcon />
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {emails.map((email, i) => (
          <button
            key={email.id}
            type="button"
            onClick={() => onSelectEmail(email)}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 13,
              padding: "14px 0",
              background: "none",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              borderBottom:
                i < emails.length - 1 ? "1px solid #F0EDE7" : "none",
              transition: "opacity 0.12s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.72")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <Avatar initials={email.initials} color={email.color} size={34} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 3,
                }}
              >
                {email.unread && <Dot color="#5549C0" size={5} />}
                <span
                  style={{
                    fontSize: 13.5,
                    fontWeight: email.unread ? 600 : 400,
                    color: "#1A1917",
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
                    fontSize: 11,
                    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                    color: "#B8B3AB",
                    flexShrink: 0,
                  }}
                >
                  {email.time}
                </span>
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: email.unread ? 500 : 400,
                  color: "#3D3C3A",
                  fontFamily: "var(--font-body, 'Inter', system-ui, sans-serif)",
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
                  fontSize: 12.5,
                  color: "#A8A49E",
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
        ))}
      </div>
    </div>
  );
}

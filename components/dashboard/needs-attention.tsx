"use client";

import React from "react";
import { Email } from "./types";
import { Avatar } from "./avatar";
import { Dot } from "./dot";
import { ArrowRightIcon } from "./icons";

export interface NeedsAttentionProps {
  emails?: Email[];
  isLoading?: boolean;
  onSelectEmail: (email: Email) => void;
  onViewInbox: () => void;
  isGmailConnected?: boolean;
  onConnectGmail?: () => void;
  className?: string;
}

export function NeedsAttention({
  emails = [],
  isLoading = false,
  onSelectEmail,
  onViewInbox,
  isGmailConnected,
  onConnectGmail,
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
            color: "var(--text-muted)",
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
            color: "var(--text-muted)",
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
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-text)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          <span>View inbox</span>
          <ArrowRightIcon />
        </button>
      </div>

      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "12px 0" }}>
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                opacity: 0.5,
                animation: "fade-in 1s infinite alternate",
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: "var(--border-hairline)",
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ width: "40%", height: 12, background: "var(--border-hairline)", borderRadius: 4 }} />
                <div style={{ width: "75%", height: 10, background: "var(--hover)", borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
      ) : isGmailConnected === false ? (
        <div
          style={{
            padding: "24px 20px",
            textAlign: "center",
            borderRadius: 12,
            background: "var(--surface-raised)",
            border: "1px dashed var(--border-dashed)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-primary)",
              fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
            }}
          >
            Gmail not connected
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              lineHeight: 1.45,
              fontFamily: "var(--font-body, 'Inter', system-ui, sans-serif)",
              maxWidth: 280,
            }}
          >
            Connect your Gmail account to manage unread emails, view threads, and draft AI replies.
          </div>
          <button
            type="button"
            onClick={onConnectGmail || onViewInbox}
            style={{
              marginTop: 4,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: 8,
              background: "var(--accent-solid)",
              color: "var(--on-accent)",
              fontSize: 12,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
              boxShadow: "0 1px 3px var(--shadow-color)",
              transition: "background 0.15s, transform 0.1s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--accent-hover)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--accent-solid)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Connect Gmail →
          </button>
        </div>
      ) : emails.length === 0 ? (
        <div
          style={{
            padding: "24px 16px",
            textAlign: "center",
            borderRadius: 10,
            background: "var(--surface-raised)",
            border: "1px dashed var(--border-dashed)",
            color: "var(--text-muted)",
            fontSize: 13,
            fontFamily: "var(--font-body, 'Inter', system-ui, sans-serif)",
          }}
        >
          All caught up! No recent threads requiring attention.
        </div>
      ) : (
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
                  i < emails.length - 1 ? "1px solid var(--border-hairline)" : "none",
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
                  {email.unread && <Dot color="var(--accent-text)" size={5} />}
                  <span
                    style={{
                      fontSize: 13.5,
                      fontWeight: email.unread ? 600 : 400,
                      color: "var(--text-primary)",
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
                      color: "var(--text-muted)",
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
                    color: "var(--text-secondary)",
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
                    color: "var(--text-muted)",
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
      )}
    </div>
  );
}

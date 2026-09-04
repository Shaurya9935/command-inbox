"use client";

import React, { useState, useRef, useEffect } from "react";
import { Email, FocusItem, UserProfile } from "./types";
import { Dot } from "./dot";
import { CommandSurface } from "./command-surface";
import { Suggestions } from "./suggestions";
import { CURRENT_USER } from "./mock-data";

export interface DefaultWorkspaceProps {
  onSelectEmail: (email: Email) => void;
  onSelectCalendar: () => void;
  onSelectInbox?: () => void;
  onSendCommand?: (command: string) => void;
  user?: UserProfile;
  focusItems?: FocusItem[];
  emails?: Email[];
  isLoading?: boolean;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

function renderFormattedMessage(text: string, isUser: boolean) {
  if (isUser) {
    return text;
  }

  const lines = text.split("\n");
  return lines.map((line, lineIdx) => {
    // Markdown headings e.g. ### Header or ## Header
    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      return (
        <div
          key={lineIdx}
          style={{
            fontWeight: 700,
            color: "#1A1917",
            marginTop: lineIdx > 0 ? 10 : 0,
            marginBottom: 4,
            fontSize: headingMatch[1].length <= 2 ? "1.1em" : "1.02em",
          }}
        >
          {headingMatch[2]}
        </div>
      );
    }

    // Bullets e.g. - or * or • or 1.
    const bulletMatch = line.match(/^(\s*)([-*•]|\d+\.)\s+(.+)$/);
    const content = bulletMatch ? bulletMatch[3] : line;

    // Parse **bold** and `code`
    const parts = content.split(/(\*\*.*?\*\*|`.*?`)/g);
    const formattedLine = parts.map((part, pIdx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={pIdx} style={{ fontWeight: 600, color: "#1A1917" }}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={pIdx}
            style={{
              background: "#F2EFE8",
              padding: "1px 5px",
              borderRadius: 4,
              fontSize: "0.9em",
              fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
            }}
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });

    if (bulletMatch) {
      const isNumbered = /^\d+\./.test(bulletMatch[2]);
      return (
        <div
          key={lineIdx}
          style={{
            display: "flex",
            gap: 8,
            marginTop: 4,
            marginBottom: 4,
            paddingLeft: bulletMatch[1].length * 4,
          }}
        >
          <span style={{ color: "#5549C0", flexShrink: 0, fontWeight: 500 }}>
            {isNumbered ? bulletMatch[2] : "•"}
          </span>
          <span style={{ flex: 1 }}>{formattedLine}</span>
        </div>
      );
    }

    return (
      <div key={lineIdx} style={{ minHeight: line.trim() === "" ? 8 : undefined }}>
        {formattedLine}
      </div>
    );
  });
}

export function DefaultWorkspace({
  onSelectEmail,
  onSelectCalendar,
  onSelectInbox,
  user = CURRENT_USER,
  emails = [],
}: DefaultWorkspaceProps) {
  const [commandInput, setCommandInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const firstName = user.name.split(" ")[0];

  const now = new Date();
  const hour = now.getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userText = text.trim();
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setCommandInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userText }),
      });

      const data = await res.json();

      let reply = "";
      let action: { label: string; onClick: () => void } | undefined = undefined;

      if (!res.ok) {
        if (res.status === 401) {
          reply = "You need to be logged in to use the Command AI assistant. Please log in and try again.";
        } else {
          reply = data.error || "Sorry, I ran into an issue processing your request. Please try again.";
        }
      } else {
        reply =
          typeof data.response === "string"
            ? data.response
            : typeof data.response?.text === "string"
            ? data.response.text
            : JSON.stringify(data.response, null, 2);

        // Intelligently infer quick action buttons based on content or user request
        const lowerText = userText.toLowerCase();
        const lowerReply = (reply || "").toLowerCase();

        if (
          lowerReply.includes("calendar") ||
          lowerReply.includes("meeting") ||
          lowerReply.includes("schedule") ||
          lowerReply.includes("event") ||
          lowerText.includes("calendar") ||
          lowerText.includes("meeting") ||
          lowerText.includes("schedule")
        ) {
          if (onSelectCalendar) {
            action = {
              label: "View Calendar →",
              onClick: onSelectCalendar,
            };
          }
        } else if (
          lowerReply.includes("email") ||
          lowerReply.includes("unread") ||
          lowerReply.includes("inbox") ||
          lowerReply.includes("thread") ||
          lowerText.includes("email") ||
          lowerText.includes("unread") ||
          lowerText.includes("inbox")
        ) {
          if (onSelectInbox) {
            action = {
              label: "Open Full Inbox →",
              onClick: onSelectInbox,
            };
          } else if (emails.length > 0 && onSelectEmail) {
            action = {
              label: "Open Thread →",
              onClick: () => onSelectEmail(emails[0]),
            };
          }
        }
      }

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        text: reply || "I couldn't generate a response. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
        action,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Failed to send message to /api/ai:", err);
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        text: "Failed to connect to the assistant. Please check your connection and try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* ── Top Context Header ── */}
      <div
        style={{
          padding: "20px 48px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #EDE9E1",
          background: "#F7F4EE",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              fontSize: 12,
              fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
              color: "#9B9691",
              letterSpacing: "0.01em",
            }}
          >
            {dateStr}
          </div>
          <div style={{ width: 1, height: 12, background: "#DEDAD3" }} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12,
              color: "#3E7868",
              fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
            }}
          >
            <Dot color="#3E7868" size={6} />
            <span>AI Assistant Active</span>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => setMessages([])}
            style={{
              background: "none",
              border: "none",
              fontSize: 12,
              color: "#9B9691",
              cursor: "pointer",
              fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
              padding: "4px 8px",
              borderRadius: 6,
              transition: "color 0.15s, background 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#5549C0";
              e.currentTarget.style.background = "#EAE6DF";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#9B9691";
              e.currentTarget.style.background = "none";
            }}
          >
            Clear chat
          </button>
        )}
      </div>

      {/* ── Chat & Command Container ── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "32px 48px 24px",
          display: "flex",
          flexDirection: "column",
          maxWidth: 780,
          width: "100%",
          margin: "0 auto",
        }}
      >
        {messages.length === 0 ? (
          /* Initial Welcome State */
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              paddingBottom: 40,
              animation: "fadeSlideIn 0.25s ease",
            }}
          >
            <div style={{ marginBottom: 28 }}>
              <h1
                style={{
                  fontSize: 26,
                  fontWeight: 600,
                  color: "#1A1917",
                  letterSpacing: "-0.03em",
                  margin: 0,
                  lineHeight: 1.25,
                  fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
                }}
              >
                Good {timeOfDay}, {firstName}.
              </h1>
              <p
                style={{
                  fontSize: 14.5,
                  color: "#8C8781",
                  margin: "8px 0 0",
                  fontFamily: "var(--font-body, 'Inter', system-ui, sans-serif)",
                  fontWeight: 400,
                }}
              >
                What would you like to take care of in your inbox or schedule?
              </p>
            </div>

            {/* Main Command Input Box */}
            <CommandSurface
              value={commandInput}
              onChange={setCommandInput}
              onSubmit={handleSendMessage}
              loading={isTyping}
              placeholder="Ask anything about your emails, draft replies, or schedule..."
            />

            {/* Prompt Suggestions */}
            <div style={{ marginTop: 24 }}>
              <div
                style={{
                  fontSize: 11.5,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "#A8A49E",
                  fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                  marginBottom: 10,
                }}
              >
                Suggested prompts
              </div>
              <Suggestions onSelectSuggestion={handleSelectSuggestion} />
            </div>
          </div>
        ) : (
          /* Active Chat Conversation Feed */
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 20,
              paddingBottom: 24,
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                  gap: 6,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 11,
                    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                    color: "#A8A49E",
                    padding: "0 4px",
                  }}
                >
                  <span>{msg.role === "user" ? firstName : "Assistant"}</span>
                  <span>·</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div
                  style={{
                    maxWidth: "88%",
                    padding: "16px 20px",
                    borderRadius: 14,
                    background: msg.role === "user" ? "#5549C0" : "#FFFFFF",
                    color: msg.role === "user" ? "#FFFFFF" : "#1A1917",
                    fontSize: 14,
                    lineHeight: 1.6,
                    fontFamily: "var(--font-body, 'Inter', system-ui, sans-serif)",
                    boxShadow:
                      msg.role === "user"
                        ? "0 2px 10px rgba(85,73,192,0.2)"
                        : "0 2px 10px rgba(0,0,0,0.04)",
                    border: msg.role === "user" ? "none" : "1px solid #E8E4DC",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {renderFormattedMessage(msg.text, msg.role === "user")}

                  {msg.action && (
                    <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #F0ECE4" }}>
                      <button
                        type="button"
                        onClick={msg.action.onClick}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          background: "#5549C0",
                          color: "#FFFFFF",
                          border: "none",
                          borderRadius: 8,
                          padding: "8px 14px",
                          fontSize: 12.5,
                          fontWeight: 500,
                          cursor: "pointer",
                          transition: "opacity 0.15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                      >
                        {msg.action.label}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 18px",
                  borderRadius: 12,
                  background: "#FFFFFF",
                  border: "1px solid #E8E4DC",
                  width: "fit-content",
                  color: "#9B9691",
                  fontSize: 12.5,
                  fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                }}
              >
                <Dot color="#5549C0" size={6} />
                <span>Command AI is thinking…</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Floating Input when chat has active messages */}
        {messages.length > 0 && (
          <div
            style={{
              position: "sticky",
              bottom: 0,
              background: "#F7F4EE",
              paddingTop: 12,
              paddingBottom: 8,
            }}
          >
            <CommandSurface
              value={commandInput}
              onChange={setCommandInput}
              onSubmit={handleSendMessage}
              loading={isTyping}
              placeholder="Reply or ask follow-up..."
            />
          </div>
        )}
      </div>
    </div>
  );
}

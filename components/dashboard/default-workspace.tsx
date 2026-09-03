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

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setCommandInput("");
    setIsTyping(true);

    // Generate intelligent AI response
    setTimeout(() => {
      const lower = text.toLowerCase();
      let reply = "";
      let action: { label: string; onClick: () => void } | undefined = undefined;

      const unreadEmails = emails.filter((e) => e.unread);

      if (
        lower.includes("email") ||
        lower.includes("unread") ||
        lower.includes("inbox") ||
        lower.includes("who sent") ||
        lower.includes("who emailed") ||
        lower.includes("summarize")
      ) {
        if (emails.length === 0) {
          reply = "Your inbox is clear! No active emails were found.";
        } else {
          const list = (unreadEmails.length > 0 ? unreadEmails : emails).slice(0, 4);
          reply = `Here is a summary of your recent ${unreadEmails.length > 0 ? "unread " : ""}emails:\n\n` +
            list
              .map(
                (e, i) =>
                  `${i + 1}. **${e.from}** — *"${e.subject}"* (${e.time})\n   ${e.preview.slice(0, 100)}...`
              )
              .join("\n\n") +
            (emails.length > 4 ? `\n\n...plus ${emails.length - 4} more in your inbox.` : "");
          
          action = {
            label: "Open Full Inbox →",
            onClick: () => {
              if (onSelectInbox) onSelectInbox();
              else if (emails[0]) onSelectEmail(emails[0]);
            },
          };
        }
      } else if (
        lower.includes("calendar") ||
        lower.includes("meeting") ||
        lower.includes("schedule") ||
        lower.includes("today")
      ) {
        reply = "Here is your agenda for today:\n\n" +
          "• **09:30 AM** — Morning standup & alignment\n" +
          "• **11:00 AM** — Product roadmap review\n" +
          "• **02:30 PM** — 1:1 Sync\n" +
          "• **04:00 PM** — Deep work & code review\n\n" +
          "Would you like me to reschedule anything or block focus time?";
        
        action = {
          label: "View Calendar →",
          onClick: onSelectCalendar,
        };
      } else if (lower.includes("draft") || lower.includes("reply") || lower.includes("write")) {
        const target = emails[0];
        if (target) {
          reply = `I've prepared a draft reply for **${target.from}** regarding *"${target.subject}"*:\n\n` +
            `"Hi ${target.from.split(" ")[0]},\n\nThanks for reaching out. I've reviewed your message and would like to move forward. Let me know what time works best for you this week.\n\nBest,\n${firstName}"\n\n` +
            `Would you like to send this now or make changes?`;
          
          action = {
            label: "Open Thread to Reply →",
            onClick: () => onSelectEmail(target),
          };
        } else {
          reply = "Who would you like to draft an email to? Give me a recipient and brief prompt, and I'll compose it for you.";
        }
      } else {
        reply = `I'm here to help manage your inbox and schedule. You can ask me to summarize unread emails, draft replies, check your meetings, or prioritize your day.`;
      }

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
        action,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 400);
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
                  {msg.text}

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
                <span>Thinking…</span>
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
              placeholder="Reply or ask follow-up..."
            />
          </div>
        )}
      </div>
    </div>
  );
}

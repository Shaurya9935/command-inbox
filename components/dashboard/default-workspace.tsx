"use client";

import React, { useState } from "react";
import { Email, FocusItem, UserProfile } from "./types";
import { Dot } from "./dot";
import { CommandSurface } from "./command-surface";
import { Suggestions } from "./suggestions";
import { FocusSection } from "./focus-section";
import { NeedsAttention } from "./needs-attention";
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

export function DefaultWorkspace({
  onSelectEmail,
  onSelectCalendar,
  onSelectInbox,
  onSendCommand,
  user = CURRENT_USER,
  focusItems,
  emails,
  isLoading,
}: DefaultWorkspaceProps) {
  const [commandInput, setCommandInput] = useState("");

  const handleSelectSuggestion = (suggestion: string) => {
    setCommandInput(suggestion);
  };

  const handleSendCommand = (text: string) => {
    if (onSendCommand) {
      onSendCommand(text);
    }
  };

  const firstName = user.name.split(" ")[0];

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          flex: 1,
          padding: "44px 56px 40px",
          maxWidth: 720,
          width: "100%",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Date context */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              fontSize: 11.5,
              fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
              color: "#B8B3AB",
              letterSpacing: "0.01em",
            }}
          >
            Sunday · August 31
          </div>
          <div style={{ width: 1, height: 10, background: "#DEDAD3" }} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 11.5,
              color: "#8BAE92",
              fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
            }}
          >
            <Dot color="#8BAE92" size={5} />
            <span>Gmail · Calendar</span>
          </div>
        </div>

        {/* Greeting */}
        <div style={{ marginBottom: 36 }}>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 600,
              color: "#1A1917",
              letterSpacing: "-0.03em",
              margin: 0,
              lineHeight: 1.2,
              fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
            }}
          >
            Good evening, {firstName}.
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "#A8A49E",
              margin: "6px 0 0",
              fontFamily: "var(--font-body, 'Inter', system-ui, sans-serif)",
              fontWeight: 400,
            }}
          >
            What would you like to take care of?
          </p>
        </div>

        {/* Command Surface */}
        <CommandSurface
          value={commandInput}
          onChange={setCommandInput}
          onSubmit={handleSendCommand}
        />

        {/* Suggestions */}
        <Suggestions onSelectSuggestion={handleSelectSuggestion} />

        {/* Your Focus */}
        <FocusSection
          items={focusItems}
          onTriggerAction={(action) => {
            if (action === "calendar") {
              onSelectCalendar();
            } else if (action === "email" && onSelectInbox) {
              onSelectInbox();
            }
          }}
        />

        {/* Needs Attention */}
        <NeedsAttention
          emails={emails}
          isLoading={isLoading}
          onSelectEmail={onSelectEmail}
          onViewInbox={onSelectInbox || (() => {})}
        />
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { GmailBrandIcon } from "@/components/connect/brand-icons";

export interface GmailConnectViewProps {
  onConnect?: () => Promise<void> | void;
  isConnecting?: boolean;
  style?: React.CSSProperties;
}

export function GmailConnectView({
  onConnect,
  isConnecting: externalConnecting,
  style,
}: GmailConnectViewProps) {
  const [internalConnecting, setInternalConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConnecting = externalConnecting || internalConnecting;

  const handleConnect = async () => {
    if (isConnecting) return;
    setError(null);

    if (onConnect) {
      try {
        await onConnect();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Connection failed");
      }
      return;
    }

    setInternalConnecting(true);
    try {
      const res = await fetch("/api/integrations/gmail/connect", {
        method: "POST",
      });
      const data = await res.json();
      if (data?.connectUrl) {
        window.location.href = data.connectUrl;
        return;
      }
      throw new Error(data?.error || "Failed to generate authorization URL");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect Gmail");
      setInternalConnecting(false);
    }
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        background: "var(--bg-page)",
        minHeight: "100%",
        fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
        ...style,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          background: "var(--surface-card)",
          border: "1px solid var(--border-hairline)",
          borderRadius: 20,
          padding: "36px 36px 32px",
          boxShadow: "0 16px 40px -8px var(--shadow-color), 0 2px 6px var(--shadow-color)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          animation: "fadeIn 0.25s ease-out",
        }}
      >
        {/* Gmail Icon Container with ambient glow */}
        <div
          style={{
            width: 68,
            height: 68,
            borderRadius: 18,
            background: "var(--danger-tint)",
            border: "1px solid var(--danger-border)",
            boxShadow: "0 8px 24px var(--shadow-color)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <GmailBrandIcon size={36} />
        </div>

        {/* Title & Tagline */}
        <h2
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: "var(--text-primary)",
            letterSpacing: "-0.025em",
            margin: "0 0 8px",
          }}
        >
          Connect your Gmail
        </h2>

        <p
          style={{
            fontSize: 13.5,
            color: "var(--text-secondary)",
            lineHeight: 1.55,
            margin: "0 0 22px",
            maxWidth: 360,
          }}
        >
          Link your Google account to read, search, and organize email threads, star important messages, and draft replies right inside Nexus.
        </p>

        {/* Feature Highlights */}
        <div
          style={{
            width: "100%",
            background: "var(--surface-raised)",
            border: "1px solid var(--border-hairline)",
            borderRadius: 12,
            padding: "14px 16px",
            marginBottom: 24,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            textAlign: "left",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "var(--accent-tint)",
                color: "var(--accent-text)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span style={{ fontSize: 12.5, color: "var(--text-primary)" }}>
              Two-way thread syncing with Inbox &amp; Sent
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "var(--accent-tint)",
                color: "var(--accent-text)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span style={{ fontSize: 12.5, color: "var(--text-primary)" }}>
              Organize with Starred, Drafts &amp; Gmail labels
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "var(--accent-tint)",
                color: "var(--accent-text)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span style={{ fontSize: 12.5, color: "var(--text-primary)" }}>
              AI summaries, smart search &amp; draft replies
            </span>
          </div>
        </div>

        {error && (
          <div
            style={{
              width: "100%",
              padding: "8px 12px",
              background: "var(--danger-tint)",
              border: "1px solid var(--danger-border)",
              borderRadius: 8,
              color: "var(--danger)",
              fontSize: 12,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        {/* Primary Connect Action Button */}
        <button
          type="button"
          onClick={handleConnect}
          disabled={isConnecting}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: "12px 24px",
            background: isConnecting ? "var(--accent-tint-hover)" : "var(--accent-solid)",
            color: "var(--on-accent)",
            border: "none",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            cursor: isConnecting ? "default" : "pointer",
            boxShadow: "0 4px 14px var(--shadow-color)",
            transition: "background 0.15s, transform 0.1s",
          }}
          onMouseDown={(e) => {
            if (!isConnecting) e.currentTarget.style.transform = "scale(0.98)";
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
          onMouseEnter={(e) => {
            if (!isConnecting) e.currentTarget.style.background = "var(--accent-hover)";
          }}
          onMouseLeave={(e) => {
            if (!isConnecting) e.currentTarget.style.background = "var(--accent-solid)";
          }}
        >
          {isConnecting ? (
            <>
              <svg
                width="15"
                height="15"
                viewBox="0 0 16 16"
                fill="none"
                style={{ animation: "spin 0.8s linear infinite" }}
              >
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity={0.35} strokeWidth="2" />
                <path d="M8 2a6 6 0 016 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span>Connecting to Google…</span>
            </>
          ) : (
            <>
              <GmailBrandIcon size={18} />
              <span>Connect Gmail</span>
            </>
          )}
        </button>

        {/* Security / Privacy footnote */}
        <div
          style={{
            marginTop: 18,
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11.5,
            color: "var(--text-muted)",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          <span>Secured via Google OAuth · Disconnect any time in Account</span>
        </div>
      </div>
    </div>
  );
}

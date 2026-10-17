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
        background: "#F5F2EC",
        minHeight: "100%",
        fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
        ...style,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          background: "#FFFFFF",
          border: "1px solid #E8E4DC",
          borderRadius: 20,
          padding: "36px 36px 32px",
          boxShadow: "0 16px 40px -8px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.02)",
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
            background: "#FEF2F2",
            border: "1px solid rgba(252, 165, 165, 0.4)",
            boxShadow: "0 8px 24px rgba(234, 67, 53, 0.12)",
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
            color: "#1A1917",
            letterSpacing: "-0.025em",
            margin: "0 0 8px",
          }}
        >
          Connect your Gmail
        </h2>

        <p
          style={{
            fontSize: 13.5,
            color: "#78716C",
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
            background: "#FAF8F4",
            border: "1px solid #EDE8E0",
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
                background: "#EAE8F8",
                color: "#5549C0",
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
            <span style={{ fontSize: 12.5, color: "#44403C" }}>
              Two-way thread syncing with Inbox &amp; Sent
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "#EAE8F8",
                color: "#5549C0",
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
            <span style={{ fontSize: 12.5, color: "#44403C" }}>
              Organize with Starred, Drafts &amp; Gmail labels
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "#EAE8F8",
                color: "#5549C0",
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
            <span style={{ fontSize: 12.5, color: "#44403C" }}>
              AI summaries, smart search &amp; draft replies
            </span>
          </div>
        </div>

        {error && (
          <div
            style={{
              width: "100%",
              padding: "8px 12px",
              background: "#FEF2F2",
              border: "1px solid #FCA5A5",
              borderRadius: 8,
              color: "#DC2626",
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
            background: isConnecting ? "#7B6ED8" : "#5046B8",
            color: "#FFFFFF",
            border: "none",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            cursor: isConnecting ? "default" : "pointer",
            boxShadow: "0 4px 14px rgba(80, 70, 184, 0.28)",
            transition: "background 0.15s, transform 0.1s",
          }}
          onMouseDown={(e) => {
            if (!isConnecting) e.currentTarget.style.transform = "scale(0.98)";
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
          onMouseEnter={(e) => {
            if (!isConnecting) e.currentTarget.style.background = "#433A9D";
          }}
          onMouseLeave={(e) => {
            if (!isConnecting) e.currentTarget.style.background = "#5046B8";
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
                <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
                <path d="M8 2a6 6 0 016 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
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
            color: "#A8A29E",
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

"use client";

import React, { useState } from "react";
import { IntegrationApp } from "./connect-types";
import {
  GmailBrandIcon,
  GoogleCalendarBrandIcon,
  OutlookBrandIcon,
  SlackBrandIcon,
  NotionBrandIcon,
  ZoomBrandIcon,
  LinearBrandIcon,
  GitHubBrandIcon,
} from "./brand-icons";

export interface ConnectCardProps {
  app: IntegrationApp;
  onConnect: (app: IntegrationApp) => void;
  onDisconnect: (app: IntegrationApp) => void;
  onSync: (app: IntegrationApp) => Promise<void>;
  isProcessing?: boolean;
}

export function ConnectCard({
  app,
  onConnect,
  onDisconnect,
  onSync,
  isProcessing = false,
}: ConnectCardProps) {
  const [copied, setCopied] = useState(false);
  const [isSyncingLocal, setIsSyncingLocal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const renderIcon = () => {
    switch (app.id) {
      case "gmail":
        return <GmailBrandIcon size={34} />;
      case "calendar":
        return <GoogleCalendarBrandIcon size={34} />;
      case "outlook":
        return <OutlookBrandIcon size={34} />;
      case "slack":
        return <SlackBrandIcon size={34} />;
      case "notion":
        return <NotionBrandIcon size={34} />;
      case "zoom":
        return <ZoomBrandIcon size={34} />;
      case "linear":
        return <LinearBrandIcon size={34} />;
      case "github":
        return <GitHubBrandIcon size={34} />;
      default:
        return (
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: app.accentColor,
              color: "#FFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            {app.name[0]}
          </div>
        );
    }
  };

  const handleCopyEmail = () => {
    if (!app.connectedEmail) return;
    navigator.clipboard?.writeText(app.connectedEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLocalSync = async () => {
    try {
      setIsSyncingLocal(true);
      await onSync(app);
    } finally {
      setIsSyncingLocal(false);
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: "#FFFFFF",
        border: app.connected ? "1.5px solid #D5E7D8" : "1px solid #E8E4DC",
        borderRadius: 14,
        padding: "22px 24px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        boxShadow: isHovered
          ? "0 10px 24px -4px rgba(0, 0, 0, 0.07), 0 2px 6px -1px rgba(0, 0, 0, 0.04)"
          : "0 1px 3px rgba(0, 0, 0, 0.02)",
        transform: isHovered ? "translateY(-2px)" : "translateY(0)",
        transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
      }}
    >
      {/* Top Section */}
      <div>
        {/* Header Row: Icon + Names + Status Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 14,
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                flexShrink: 0,
                filter: app.connected ? "none" : "grayscale(20%)",
                transition: "filter 0.2s",
              }}
            >
              {renderIcon()}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#1A1917",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {app.name}
                </h3>
                {app.badge && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      padding: "2px 7px",
                      borderRadius: 99,
                      background: app.bgAccent,
                      color: app.accentColor,
                    }}
                  >
                    {app.badge}
                  </span>
                )}
              </div>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: 12,
                  color: "#858079",
                }}
              >
                {app.tagline}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div>
            {app.connected ? (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 10px",
                  borderRadius: 20,
                  background: "#ECFDF5",
                  border: "1px solid #A7F3D0",
                  color: "#065F46",
                  fontSize: 11.5,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                <span
                  style={{
                    width: 6.5,
                    height: 6.5,
                    borderRadius: "50%",
                    background: "#10B981",
                    boxShadow: "0 0 0 2px rgba(16, 185, 129, 0.2)",
                    animation: "pulseDot 2s infinite ease-in-out",
                  }}
                />
                Connected
              </div>
            ) : (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 10px",
                  borderRadius: 20,
                  background: "#F5F2EB",
                  border: "1px solid #E4DED4",
                  color: "#78726A",
                  fontSize: 11.5,
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                }}
              >
                <span
                  style={{
                    width: 5.5,
                    height: 5.5,
                    borderRadius: "50%",
                    background: "#A8A29E",
                  }}
                />
                Not connected
              </div>
            )}
          </div>
        </div>

        {/* Connected Account Email Banner */}
        <div style={{ marginBottom: 16 }}>
          {app.connected ? (
            <div
              style={{
                background: "#F9FBF9",
                border: "1px solid #E2EFE4",
                borderRadius: 9,
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                {/* Envelope / Account Icon */}
                <svg
                  width={14}
                  height={14}
                  viewBox="0 0 16 16"
                  fill="none"
                  style={{ flexShrink: 0, color: "#16A34A" }}
                >
                  <path
                    d="M2 4a1.5 1.5 0 011.5-1.5h9A1.5 1.5 0 0114 4v8a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 012 12V4z"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                  <path
                    d="M2.5 4.5L8 9l5.5-4.5"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                </svg>
                <div style={{ minWidth: 0 }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#1E293B",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      display: "block",
                    }}
                    title={app.connectedEmail}
                  >
                    {app.connectedEmail || "Authorized Account"}
                  </span>
                </div>
              </div>

              {/* Copy / Details helper */}
              <button
                onClick={handleCopyEmail}
                title="Copy connected email"
                style={{
                  background: "transparent",
                  border: "none",
                  padding: "3px 6px",
                  borderRadius: 4,
                  fontSize: 11,
                  color: copied ? "#16A34A" : "#64748B",
                  cursor: "pointer",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  transition: "color 0.12s",
                }}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          ) : (
            <div
              style={{
                background: "#FAFAF9",
                border: "1px dashed #E2DED6",
                borderRadius: 9,
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <svg
                width={13}
                height={13}
                viewBox="0 0 16 16"
                fill="none"
                style={{ flexShrink: 0, color: "#A8A29E" }}
              >
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
                <path d="M8 5v3M8 11h.01" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <span style={{ fontSize: 11.5, color: "#8C867E" }}>
                No account linked. Authorize to start syncing.
              </span>
            </div>
          )}
        </div>

        {/* App Description */}
        <p
          style={{
            margin: "0 0 16px",
            fontSize: 12.5,
            lineHeight: 1.5,
            color: "#4A4642",
          }}
        >
          {app.description}
        </p>

        {/* Feature Capabilities Tags */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontSize: 10.5,
              fontWeight: 600,
              letterSpacing: "0.05em",
              color: "#A39E96",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Capabilities
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {app.capabilities.slice(0, 3).map((cap, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  fontSize: 11.5,
                  color: "#57534E",
                }}
              >
                <svg
                  width={11}
                  height={11}
                  viewBox="0 0 14 14"
                  fill="none"
                  style={{
                    flexShrink: 0,
                    color: app.connected ? "#10B981" : "#94A3B8",
                  }}
                >
                  <path
                    d="M2.5 7.5L5.5 10.5L11.5 3.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>{cap}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div
        style={{
          borderTop: "1px solid #F1ECE4",
          paddingTop: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        {app.connected ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Sync Now Button */}
              <button
                onClick={handleLocalSync}
                disabled={isSyncingLocal || isProcessing}
                style={{
                  padding: "7px 12px",
                  borderRadius: 7,
                  border: "1px solid #E2DED6",
                  background: "#FFFFFF",
                  color: "#3F3C37",
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: isSyncingLocal ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "background 0.12s, border-color 0.12s",
                }}
                onMouseEnter={(e) => {
                  if (!isSyncingLocal) e.currentTarget.style.background = "#F9F6F0";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#FFFFFF";
                }}
              >
                <svg
                  width={12}
                  height={12}
                  viewBox="0 0 16 16"
                  fill="none"
                  style={{
                    animation: isSyncingLocal ? "spin 1s linear infinite" : "none",
                  }}
                >
                  <path
                    d="M14 8A6 6 0 118 2a6 6 0 015.66 4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  <path
                    d="M14 2v4h-4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {isSyncingLocal ? "Syncing…" : "Sync"}
              </button>

              {/* Reconnect Option */}
              <button
                onClick={() => onConnect(app)}
                disabled={isProcessing}
                title="Reconnect or refresh authorization"
                style={{
                  padding: "7px 10px",
                  borderRadius: 7,
                  border: "none",
                  background: "transparent",
                  color: "#6B6762",
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "color 0.12s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#1A1917";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#6B6762";
                }}
              >
                Reconnect
              </button>
            </div>

            {/* Disconnect Button */}
            <button
              onClick={() => onDisconnect(app)}
              disabled={isProcessing}
              style={{
                padding: "7px 11px",
                borderRadius: 7,
                border: "1px solid #FEE2E2",
                background: "#FEF2F2",
                color: "#DC2626",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                transition: "background 0.12s, border-color 0.12s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#FEE2E2";
                e.currentTarget.style.borderColor = "#FCA5A5";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#FEF2F2";
                e.currentTarget.style.borderColor = "#FEE2E2";
              }}
            >
              Disconnect
            </button>
          </>
        ) : (
          /* Connect Button */
          <button
            onClick={() => onConnect(app)}
            disabled={isProcessing}
            style={{
              width: "100%",
              padding: "9px 16px",
              borderRadius: 8,
              border: `1px solid ${app.accentColor}`,
              background: app.accentColor,
              color: "#FFFFFF",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
              transition: "transform 0.12s, opacity 0.12s, box-shadow 0.12s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.92";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 3px 8px rgba(0, 0, 0, 0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.08)";
            }}
          >
            <svg width={13} height={13} viewBox="0 0 16 16" fill="none">
              <path
                d="M8 3v10M3 8h10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Connect {app.name}
          </button>
        )}
      </div>

      <style>{`
        @keyframes pulseDot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.7; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";

type Service = "gmail" | "calendar";

export function ConnectClient() {
  const [loadingService, setLoadingService] = useState<Service | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async (service: Service) => {
    setLoadingService(service);
    setError(null);
    try {
      const endpoint =
        service === "gmail"
          ? "/api/integrations/gmail/connect"
          : "/api/integrations/calendar/connect";

      const response = await fetch(endpoint, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(
          data?.error || `Failed to connect ${service === "gmail" ? "Gmail" : "Google Calendar"}`
        );
      }

      const { connectUrl } = await response.json();

      if (connectUrl) {
        window.location.href = connectUrl;
      } else {
        throw new Error("No connect URL returned by the server");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : `Failed to connect ${service === "gmail" ? "Gmail" : "Google Calendar"}`;
      setError(message);
      setLoadingService(null);
    }
  };

  return (
    <AuthLayout>
      <div className="flex flex-col items-center text-center">
        <h1
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: "#1A1917",
            letterSpacing: "-0.025em",
            margin: "0 0 8px",
          }}
        >
          Connect your workspaces
        </h1>

        <p
          style={{
            fontSize: 13.5,
            color: "#7B7775",
            lineHeight: 1.5,
            margin: "0 0 24px",
          }}
        >
          Link your Google services to sync threads, manage your calendar, and power Command Inbox with AI.
        </p>

        {error && (
          <div
            style={{
              width: "100%",
              padding: "10px 14px",
              background: "#FDF2F2",
              border: "1px solid #F8D7DA",
              borderRadius: 8,
              color: "#C53030",
              fontSize: 12.5,
              marginBottom: 16,
              textAlign: "left",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Gmail Card */}
          <div
            style={{
              width: "100%",
              padding: "14px 16px",
              background: "#FFFFFF",
              border: "1px solid #E8E4DC",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              textAlign: "left",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 9,
                  background: "#FDF2F0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  border: "1px solid #FCE8E6",
                }}
              >
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                    stroke="#EA4335"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M22 6l-10 7L2 6"
                    stroke="#EA4335"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "#1A1917" }}>
                  Gmail
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#8C8782",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  Emails & AI thread management
                </div>
              </div>
            </div>

            <button
              onClick={() => handleConnect("gmail")}
              disabled={loadingService !== null}
              style={{
                padding: "8px 14px",
                background: loadingService === "gmail" ? "#837BBE" : "#5549C0",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 7,
                fontSize: 12.5,
                fontWeight: 500,
                cursor: loadingService !== null ? "not-allowed" : "pointer",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {loadingService === "gmail" ? "Connecting…" : "Connect"}
            </button>
          </div>

          {/* Google Calendar Card */}
          <div
            style={{
              width: "100%",
              padding: "14px 16px",
              background: "#FFFFFF",
              border: "1px solid #E8E4DC",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              textAlign: "left",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 9,
                  background: "#F0F5FD",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  border: "1px solid #E1EDFC",
                }}
              >
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <rect
                    x="3"
                    y="4"
                    width="18"
                    height="17"
                    rx="2"
                    stroke="#1A73E8"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M3 9h18M8 2v4M16 2v4"
                    stroke="#1A73E8"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <rect x="7" y="12" width="3" height="3" rx="0.5" fill="#1A73E8" />
                  <rect x="11.5" y="12" width="3" height="3" rx="0.5" fill="#1A73E8" />
                  <rect x="11.5" y="16" width="3" height="3" rx="0.5" fill="#1A73E8" />
                </svg>
              </div>

              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "#1A1917" }}>
                  Google Calendar
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#8C8782",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  Events, schedule & daily agenda
                </div>
              </div>
            </div>

            <button
              onClick={() => handleConnect("calendar")}
              disabled={loadingService !== null}
              style={{
                padding: "8px 14px",
                background: loadingService === "calendar" ? "#837BBE" : "#5549C0",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 7,
                fontSize: 12.5,
                fontWeight: 500,
                cursor: loadingService !== null ? "not-allowed" : "pointer",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {loadingService === "calendar" ? "Connecting…" : "Connect"}
            </button>
          </div>
        </div>

        <a
          href="/dashboard"
          style={{
            marginTop: 20,
            fontSize: 12.5,
            color: "#9B9691",
            textDecoration: "none",
          }}
        >
          Skip for now →
        </a>
      </div>
    </AuthLayout>
  );
}

export { ConnectClient as ConnectGmailButton };

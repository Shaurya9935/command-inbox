"use client";

import React, { useState } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";

export default function ConnectPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/integrations/gmail/connect", {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Failed to create Gmail connection");
      }

      const { connectUrl } = await response.json();

      if (connectUrl) {
        window.location.href = connectUrl;
      } else {
        throw new Error("No connect URL returned by the server");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to connect Gmail";
      setError(message);
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="flex flex-col items-center text-center">
        {/* Gmail Icon Badge */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: "#F2EFE9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <path
              d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
              stroke="#EA4335"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M22 6l-10 7L2 6"
              stroke="#EA4335"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: "#1A1917",
            letterSpacing: "-0.025em",
            margin: "0 0 8px",
          }}
        >
          Connect your Gmail
        </h1>

        <p
          style={{
            fontSize: 13.5,
            color: "#7B7775",
            lineHeight: 1.5,
            margin: "0 0 24px",
          }}
        >
          Link your Google account to sync threads, reply to emails, and manage your inbox with AI.
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

        <button
          onClick={handleConnect}
          disabled={isLoading}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: "11px 16px",
            background: isLoading ? "#837BBE" : "#5549C0",
            color: "#FFFFFF",
            border: "none",
            borderRadius: 9,
            fontSize: 14,
            fontWeight: 500,
            cursor: isLoading ? "not-allowed" : "pointer",
            boxShadow: "0 2px 8px rgba(85,73,192,0.25)",
            transition: "all 0.15s ease",
          }}
        >
          {isLoading ? (
            <span>Connecting…</span>
          ) : (
            <>
              <span>Connect with Google</span>
            </>
          )}
        </button>

        <a
          href="/dashboard"
          style={{
            marginTop: 16,
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

export { ConnectPage as ConnectGmailButton };
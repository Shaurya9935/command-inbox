"use client";

import React from "react";
import { IntegrationApp } from "./connect-types";

export interface DisconnectModalProps {
  app: IntegrationApp;
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function DisconnectModal({
  app,
  onConfirm,
  onCancel,
  isSubmitting = false,
}: DisconnectModalProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onCancel}
        style={{
          position: "fixed",
          inset: 0,
          background: "var(--bg-overlay)",
          backdropFilter: "blur(2px)",
          animation: "fadeIn 0.15s ease",
        }}
      />

      {/* Modal Card */}
      <div
        style={{
          position: "relative",
          zIndex: 101,
          width: "100%",
          maxWidth: 420,
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 14,
          padding: "24px 26px",
          boxShadow: "var(--shadow-modal)",
          animation: "scaleIn 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
          fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: "var(--status-error-bg)",
              color: "var(--status-error-text)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <path
                d="M12 9v4M12 17h.01M5.07 19h13.86a2 2 0 001.73-3L13.73 4a2 2 0 00-3.46 0L3.34 16a2 2 0 001.73 3z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>
              Disconnect {app.name}?
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "var(--text-tertiary)" }}>
              {app.connectedEmail || "Authorized Account"}
            </p>
          </div>
        </div>

        <p style={{ margin: "0 0 20px", fontSize: 13, lineHeight: 1.5, color: "var(--text-secondary)" }}>
          Disconnecting <strong>{app.name}</strong> will revoke access and stop automatic synchronization
          with your Nexus. You can re-authorize this connection at any time.
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10 }}>
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid var(--border-subtle)",
              background: "var(--bg-card)",
              color: "var(--text-secondary)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            style={{
              padding: "8px 18px",
              borderRadius: 8,
              border: "1px solid var(--status-error-text)",
              background: "var(--status-error-text)",
              color: "var(--text-inverse)",
              fontSize: 13,
              fontWeight: 600,
              cursor: isSubmitting ? "not-allowed" : "pointer",
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            {isSubmitting ? "Disconnecting…" : "Disconnect"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.96) translateY(4px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>
    </div>
  );
}

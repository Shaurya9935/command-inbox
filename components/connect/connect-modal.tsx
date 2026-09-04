"use client";

import React, { useState } from "react";
import { IntegrationApp } from "./connect-types";

export interface ConnectModalProps {
  app: IntegrationApp;
  defaultEmail?: string;
  onConfirm: (app: IntegrationApp, accountEmail?: string) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ConnectModal({
  app,
  defaultEmail = "",
  onConfirm,
  onCancel,
  isSubmitting = false,
}: ConnectModalProps) {
  const [accountEmail, setAccountEmail] = useState(defaultEmail);
  const [useCustomToken, setUseCustomToken] = useState(false);
  const [apiToken, setApiToken] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(app, accountEmail || defaultEmail || `${app.id}-user@work.com`);
  };

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
          background: "rgba(0, 0, 0, 0.45)",
          backdropFilter: "blur(3px)",
          animation: "fadeIn 0.15s ease",
        }}
      />

      {/* Modal Dialog */}
      <div
        style={{
          position: "relative",
          zIndex: 101,
          width: "100%",
          maxWidth: 480,
          background: "#FFFFFF",
          border: "1px solid #E8E4DC",
          borderRadius: 16,
          padding: "26px 28px",
          boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.18), 0 4px 14px rgba(0, 0, 0, 0.06)",
          animation: "scaleIn 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
          fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: app.bgAccent,
                border: `1px solid ${app.accentColor}25`,
                color: app.accentColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              {app.name[0]}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: "#1A1917" }}>
                Connect {app.name}
              </h3>
              <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "#78716C" }}>
                {app.categoryLabel}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            style={{
              background: "transparent",
              border: "none",
              color: "#9CA3AF",
              cursor: "pointer",
              padding: 6,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* App Summary */}
          <p style={{ margin: "0 0 16px", fontSize: 13, lineHeight: 1.5, color: "#57534E" }}>
            {app.description}
          </p>

          {/* Scopes Requested */}
          <div
            style={{
              background: "#F9F8F6",
              border: "1px solid #ECE8E1",
              borderRadius: 10,
              padding: "12px 14px",
              marginBottom: 18,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 600, color: "#858079", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
              Required Permissions
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {app.permissions.map((perm, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "#44403C" }}>
                  <svg width={12} height={12} viewBox="0 0 14 14" fill="none" style={{ color: "#16A34A", flexShrink: 0 }}>
                    <path d="M2.5 7.5L5.5 10.5L11.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{perm}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Account Email Input */}
          <div style={{ marginBottom: 16 }}>
            <label
              htmlFor="connect-account-email"
              style={{ display: "block", fontSize: 12.5, fontWeight: 500, color: "#292524", marginBottom: 6 }}
            >
              Account Email or Workspace ID
            </label>
            <input
              id="connect-account-email"
              type="text"
              value={accountEmail}
              onChange={(e) => setAccountEmail(e.target.value)}
              placeholder="e.g. user@company.com or workspace-slug"
              required
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: 8,
                border: "1px solid #D6D3CD",
                fontSize: 13,
                outline: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = app.accentColor)}
              onBlur={(e) => (e.target.style.borderColor = "#D6D3CD")}
            />
          </div>

          {/* Custom Token Toggle */}
          <div style={{ marginBottom: 20 }}>
            <button
              type="button"
              onClick={() => setUseCustomToken(!useCustomToken)}
              style={{
                background: "transparent",
                border: "none",
                padding: 0,
                fontSize: 12,
                color: app.accentColor,
                cursor: "pointer",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span>{useCustomToken ? "Hide advanced configuration" : "+ Advanced: Configure API Key / Token"}</span>
            </button>

            {useCustomToken && (
              <div style={{ marginTop: 8 }}>
                <input
                  type="password"
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                  placeholder={`Paste your ${app.name} API token or bot secret`}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid #D6D3CD",
                    fontSize: 12.5,
                    outline: "none",
                    fontFamily: "monospace",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10 }}>
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              style={{
                padding: "9px 16px",
                borderRadius: 8,
                border: "1px solid #D6D3CD",
                background: "#FFFFFF",
                color: "#44403C",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: "9px 20px",
                borderRadius: 8,
                border: `1px solid ${app.accentColor}`,
                background: app.accentColor,
                color: "#FFFFFF",
                fontSize: 13,
                fontWeight: 600,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              }}
            >
              {isSubmitting ? (
                <>
                  <svg width={14} height={14} viewBox="0 0 16 16" fill="none" style={{ animation: "spin 1s linear infinite" }}>
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="16" />
                  </svg>
                  Authorizing…
                </>
              ) : (
                `Authorize & Link ${app.name}`
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.96) translateY(4px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

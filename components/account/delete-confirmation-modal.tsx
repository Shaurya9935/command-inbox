"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export interface DeleteConfirmationModalProps {
  isOpen: boolean;
  mode: "data" | "account";
  hasPassword: boolean;
  onClose: () => void;
  onSuccess: (result: {
    deletedCounts: Record<string, number>;
    revocations: Record<string, { revoked: boolean; error?: string }>;
  }) => void;
}

export function DeleteConfirmationModal({
  isOpen,
  mode,
  hasPassword,
  onClose,
  onSuccess,
}: DeleteConfirmationModalProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isDeleteValid =
    confirmation.trim() === "DELETE" && (!hasPassword || password.trim().length > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDeleteValid || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const endpoint =
        mode === "account" ? "/api/account/delete" : "/api/account/delete-data";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: hasPassword ? password : undefined,
          confirmation,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMessage(data?.error || "Failed to process request. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Success
      if (mode === "account") {
        await authClient.signOut().catch(() => {});
        router.push("/login");
      } else {
        onSuccess({
          deletedCounts: data.deletedCounts || {},
          revocations: data.revocations || {},
        });
        onClose();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(26, 25, 23, 0.45)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        style={{
          width: "100%",
          maxWidth: 520,
          background: "#FFFFFF",
          borderRadius: 14,
          boxShadow: "0 20px 40px rgba(0,0,0,0.18), 0 1px 3px rgba(0,0,0,0.08)",
          border: "1px solid #E8E4DC",
          overflow: "hidden",
          animation: "fadeIn 0.15s ease-out",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px 16px",
            borderBottom: "1px solid #F0ECE4",
            display: "flex",
            alignItems: "flex-start",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "#FEE2E2",
              color: "#DC2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>

          <div style={{ flex: 1 }}>
            <h3
              style={{
                margin: 0,
                fontSize: 17,
                fontWeight: 600,
                color: "#1A1917",
                letterSpacing: "-0.01em",
              }}
            >
              {mode === "account" ? "Delete Account & All Data" : "Delete All Synced Data"}
            </h3>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 13,
                color: "#6B6762",
                lineHeight: 1.45,
              }}
            >
              {mode === "account"
                ? "This will permanently delete your account, credentials, and all synchronized history. This action cannot be reversed."
                : "This removes all cached emails, calendar events, AI conversations, and permissions, but keeps your login account active."}
            </p>
          </div>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} style={{ padding: "20px 24px" }}>
          {/* Items that will be deleted */}
          <div
            style={{
              background: "#FFF8F6",
              border: "1px solid #FEE2E2",
              borderRadius: 9,
              padding: "12px 14px",
              marginBottom: 18,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#991B1B",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                marginBottom: 8,
              }}
            >
              What will be deleted:
            </div>
            <ul
              style={{
                margin: 0,
                paddingLeft: 18,
                fontSize: 12.5,
                color: "#7F1D1D",
                lineHeight: 1.5,
              }}
            >
              <li>Cached emails and thread synchronizations (Gmail)</li>
              <li>Cached calendar events and scheduling states (Google Calendar)</li>
              <li>All chat messages, AI memory, and assistant conversations</li>
              <li>Pending approvals, cautious permissions, and Corsair account links</li>
              <li>OAuth tokens will be revoked with Google</li>
              {mode === "account" && (
                <li style={{ fontWeight: 600 }}>
                  Your user login, active auth sessions, and user profile
                </li>
              )}
            </ul>
          </div>

          {/* Inline Error */}
          {errorMessage && (
            <div
              style={{
                background: "#FEF2F2",
                border: "1px solid #FCA5A5",
                borderRadius: 8,
                padding: "10px 12px",
                marginBottom: 16,
                fontSize: 13,
                color: "#991B1B",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Password Input (if user has a password) */}
          {hasPassword ? (
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: "#1A1917",
                  marginBottom: 6,
                }}
              >
                Enter your password to verify:
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your current password"
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: 8,
                  border: "1px solid #DED8CE",
                  fontSize: 13.5,
                  color: "#1A1917",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.12s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#DC2626")}
                onBlur={(e) => (e.target.style.borderColor = "#DED8CE")}
              />
            </div>
          ) : (
            <div
              style={{
                marginBottom: 16,
                padding: "8px 12px",
                borderRadius: 8,
                background: "#F5F2EC",
                fontSize: 12.5,
                color: "#5C564E",
              }}
            >
              Signed in via Google Social Login. Identity confirmed via active session.
            </div>
          )}

          {/* Confirmation Input */}
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                fontSize: 12.5,
                fontWeight: 600,
                color: "#1A1917",
                marginBottom: 6,
              }}
            >
              To confirm, type <span style={{ color: "#DC2626", fontWeight: 700 }}>DELETE</span> below:
            </label>
            <input
              type="text"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="DELETE"
              disabled={isSubmitting}
              autoComplete="off"
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: 8,
                border: "1px solid #DED8CE",
                fontSize: 13.5,
                color: "#1A1917",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.12s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#DC2626")}
              onBlur={(e) => (e.target.style.borderColor = "#DED8CE")}
            />
          </div>

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 10,
              paddingTop: 8,
              borderTop: "1px solid #F0ECE4",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: "8px 16px",
                borderRadius: 7,
                border: "1px solid #E4DED4",
                background: "#FFFFFF",
                fontSize: 13,
                fontWeight: 500,
                color: "#5C564E",
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!isDeleteValid || isSubmitting}
              style={{
                padding: "8px 18px",
                borderRadius: 7,
                border: "none",
                background: isDeleteValid && !isSubmitting ? "#DC2626" : "#FCA5A5",
                color: "#FFFFFF",
                fontSize: 13,
                fontWeight: 600,
                cursor: isDeleteValid && !isSubmitting ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "background 0.12s",
              }}
            >
              {isSubmitting ? (
                <>
                  <span
                    style={{
                      width: 13,
                      height: 13,
                      border: "2px solid rgba(255,255,255,0.4)",
                      borderTopColor: "#FFFFFF",
                      borderRadius: "50%",
                      animation: "spin 0.6s linear infinite",
                      display: "inline-block",
                    }}
                  />
                  <span>Deleting...</span>
                </>
              ) : (
                <span>
                  {mode === "account" ? "Delete Account Permanently" : "Delete Synced Data"}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.97);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Avatar } from "@/components/dashboard/avatar";
import { useTour } from "@/components/onboarding";
import { ThemeSegmentedControl } from "@/components/theme";

export interface ProfileCardProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  onUserUpdated: (updated: { name?: string; email?: string }) => void;
}

export function ProfileCard({ user, onUserUpdated }: ProfileCardProps) {
  const { startTour } = useTour();
  // Name state
  const [name, setName] = useState(user.name || "");
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameStatus, setNameStatus] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Email change state
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Calculate initials
  const initials = (name || user.email || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSavingName) return;

    setIsSavingName(true);
    setNameStatus(null);

    try {
      const res = await authClient.updateUser({
        name: name.trim(),
      });

      if (res.error) {
        setNameStatus({ message: res.error.message || "Failed to update name", type: "error" });
      } else {
        setNameStatus({ message: "Name updated successfully", type: "success" });
        onUserUpdated({ name: name.trim() });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update name";
      setNameStatus({ message: msg, type: "error" });
    } finally {
      setIsSavingName(false);
    }
  };

  const handleSaveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || isSavingEmail) return;

    setIsSavingEmail(true);
    setEmailStatus(null);

    try {
      const res = await authClient.changeEmail({
        newEmail: newEmail.trim(),
        callbackURL: "/dashboard/account",
      });

      if (res.error) {
        setEmailStatus({ message: res.error.message || "Failed to change email", type: "error" });
      } else {
        setEmailStatus({
          message:
            "Email update initiated. If verification is required, please check your inbox.",
          type: "success",
        });
        onUserUpdated({ email: newEmail.trim() });
        setNewEmail("");
        setIsChangingEmail(false);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to change email";
      setEmailStatus({ message: msg, type: "error" });
    } finally {
      setIsSavingEmail(false);
    }
  };

  return (
    <div
      id="profile"
      style={{
        background: "var(--surface-card)",
        borderRadius: 14,
        border: "1px solid var(--border-hairline)",
        padding: "24px 28px",
        boxShadow: "0 1px 3px var(--shadow-color)",
        scrollMarginTop: 80,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 600,
              color: "var(--text-primary)",
              letterSpacing: "-0.01em",
            }}
          >
            Profile Information
          </h2>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 13,
              color: "var(--text-secondary)",
            }}
          >
            Manage your personal details and verified email address
          </p>
        </div>

        <button
          type="button"
          onClick={() => startTour()}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            borderRadius: 8,
            background: "var(--hover-subtle)",
            border: "1px solid var(--border-hairline)",
            color: "var(--accent-solid)",
            fontSize: 12.5,
            fontWeight: 600,
            cursor: "pointer",
            transition: "background 0.12s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--hover-subtle)")}
        >
          <span style={{ fontSize: 13 }}>🧭</span>
          <span>Replay tour</span>
        </button>
      </div>

      {/* Avatar & Summary Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "16px 18px",
          borderRadius: 10,
          background: "var(--surface-raised)",
          border: "1px solid var(--border-hairline)",
          marginBottom: 24,
        }}
      >
        <Avatar initials={initials} color="var(--accent-text)" size={48} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            {name || "User"}
          </div>
          <div
            style={{
              fontSize: 12.5,
              color: "var(--text-muted)",
              marginTop: 2,
            }}
          >
            {user.email}
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Name Input */}
        <form onSubmit={handleSaveName}>
          <div style={{ marginBottom: 6 }}>
            <label
              style={{
                display: "block",
                fontSize: 12.5,
                fontWeight: 600,
                color: "var(--text-primary)",
                marginBottom: 6,
              }}
            >
              Full Name
            </label>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                disabled={isSavingName}
                style={{
                  flex: 1,
                  maxWidth: 400,
                  padding: "9px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border-strong)",
                  fontSize: 13.5,
                  color: "var(--text-primary)",
                  outline: "none",
                  boxSizing: "border-box",
                  background: "var(--surface-card)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent-text)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-strong)")}
              />
              <button
                type="submit"
                disabled={isSavingName || name.trim() === user.name}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "1px solid var(--border-hairline)",
                  background:
                    name.trim() === user.name || isSavingName ? "var(--hover-subtle)" : "var(--text-primary)",
                  color: name.trim() === user.name || isSavingName ? "var(--text-muted)" : "var(--bg-page)",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor:
                    name.trim() === user.name || isSavingName ? "not-allowed" : "pointer",
                  transition: "background 0.12s",
                }}
              >
                {isSavingName ? "Saving..." : "Save Name"}
              </button>
            </div>
          </div>

          {nameStatus && (
            <div
              style={{
                marginTop: 6,
                fontSize: 12.5,
                color: nameStatus.type === "success" ? "var(--success)" : "var(--danger)",
                fontWeight: 500,
              }}
            >
              {nameStatus.message}
            </div>
          )}
        </form>

        <div style={{ height: 1, background: "var(--border-hairline)" }} />

        {/* Email Display & Update */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: 12.5,
              fontWeight: 600,
              color: "var(--text-primary)",
              marginBottom: 6,
            }}
          >
            Email Address
          </label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              maxWidth: 550,
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid var(--border-hairline)",
              background: "var(--surface-raised)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 13.5, color: "var(--text-primary)", fontWeight: 500 }}>
                {user.email}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--success)",
                  background: "var(--success-tint)",
                  border: "1px solid var(--success-border)",
                  padding: "1px 7px",
                  borderRadius: 12,
                }}
              >
                Verified
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsChangingEmail((prev) => !prev);
                setEmailStatus(null);
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--accent-text)",
                fontSize: 12.5,
                fontWeight: 500,
                cursor: "pointer",
                padding: "2px 6px",
              }}
            >
              {isChangingEmail ? "Cancel" : "Change Email"}
            </button>
          </div>

          {/* Change Email Form */}
          {isChangingEmail && (
            <form onSubmit={handleSaveEmail} style={{ marginTop: 12, maxWidth: 550 }}>
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter new email address"
                  disabled={isSavingEmail}
                  required
                  style={{
                    flex: 1,
                    padding: "9px 12px",
                    borderRadius: 8,
                    border: "1px solid var(--border-strong)",
                    fontSize: 13.5,
                    color: "var(--text-primary)",
                    outline: "none",
                    background: "var(--surface-card)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--accent-text)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border-strong)")}
                />
                <button
                  type="submit"
                  disabled={isSavingEmail || !newEmail.trim()}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "1px solid var(--border-hairline)",
                    background: !newEmail.trim() || isSavingEmail ? "var(--hover-subtle)" : "var(--text-primary)",
                    color: !newEmail.trim() || isSavingEmail ? "var(--text-muted)" : "var(--bg-page)",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: !newEmail.trim() || isSavingEmail ? "not-allowed" : "pointer",
                  }}
                >
                  {isSavingEmail ? "Sending..." : "Update Email"}
                </button>
              </div>
              <p style={{ margin: "6px 0 0", fontSize: 11.5, color: "var(--text-muted)" }}>
                Better Auth will process your email change and send verification instructions if enabled.
              </p>
            </form>
          )}

          {emailStatus && (
            <div
              style={{
                marginTop: 8,
                fontSize: 12.5,
                color: emailStatus.type === "success" ? "var(--success)" : "var(--danger)",
                fontWeight: 500,
              }}
            >
              {emailStatus.message}
            </div>
          )}
        </div>

        <div style={{ height: 1, background: "var(--border-hairline)" }} />

        {/* Appearance / Theme */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: 12.5,
              fontWeight: 600,
              color: "var(--text-primary)",
              marginBottom: 4,
            }}
          >
            Appearance
          </label>
          <p
            style={{
              margin: "0 0 10px",
              fontSize: 12.5,
              color: "var(--text-secondary)",
            }}
          >
            Customize your interface theme across light, warm-charcoal dark, or system preference
          </p>
          <ThemeSegmentedControl />
        </div>
      </div>
    </div>
  );
}

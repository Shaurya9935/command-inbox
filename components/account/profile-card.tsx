"use client";

import React, { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Avatar } from "@/components/dashboard/avatar";
import { useTour } from "@/components/onboarding";

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
        background: "#FFFFFF",
        borderRadius: 14,
        border: "1px solid #E8E4DC",
        padding: "24px 28px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
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
              color: "#1A1917",
              letterSpacing: "-0.01em",
            }}
          >
            Profile Information
          </h2>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 13,
              color: "#6B6762",
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
            background: "#F5F2EC",
            border: "1px solid #E8E4DC",
            color: "#5046B8",
            fontSize: 12.5,
            fontWeight: 600,
            cursor: "pointer",
            transition: "background 0.12s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#EDE8DF")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#F5F2EC")}
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
          background: "#FBF9F5",
          border: "1px solid #EFECE6",
          marginBottom: 24,
        }}
      >
        <Avatar initials={initials} color="#5549C0" size={48} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#1A1917",
            }}
          >
            {name || "User"}
          </div>
          <div
            style={{
              fontSize: 12.5,
              color: "#858079",
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
                color: "#1A1917",
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
                  border: "1px solid #DED8CE",
                  fontSize: 13.5,
                  color: "#1A1917",
                  outline: "none",
                  boxSizing: "border-box",
                  background: "#FFFFFF",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#5549C0")}
                onBlur={(e) => (e.target.style.borderColor = "#DED8CE")}
              />
              <button
                type="submit"
                disabled={isSavingName || name.trim() === user.name}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "1px solid #1A1917",
                  background:
                    name.trim() === user.name || isSavingName ? "#EAE5DB" : "#1A1917",
                  color: name.trim() === user.name || isSavingName ? "#858079" : "#FDFCF8",
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
                color: nameStatus.type === "success" ? "#16A34A" : "#DC2626",
                fontWeight: 500,
              }}
            >
              {nameStatus.message}
            </div>
          )}
        </form>

        <div style={{ height: 1, background: "#F0ECE4" }} />

        {/* Email Display & Update */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: 12.5,
              fontWeight: 600,
              color: "#1A1917",
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
              border: "1px solid #E8E4DC",
              background: "#FBF9F5",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 13.5, color: "#1A1917", fontWeight: 500 }}>
                {user.email}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#16A34A",
                  background: "#ECFDF5",
                  border: "1px solid #BBF7D0",
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
                color: "#5549C0",
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
                    border: "1px solid #DED8CE",
                    fontSize: 13.5,
                    color: "#1A1917",
                    outline: "none",
                    background: "#FFFFFF",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#5549C0")}
                  onBlur={(e) => (e.target.style.borderColor = "#DED8CE")}
                />
                <button
                  type="submit"
                  disabled={isSavingEmail || !newEmail.trim()}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "1px solid #1A1917",
                    background: !newEmail.trim() || isSavingEmail ? "#EAE5DB" : "#1A1917",
                    color: !newEmail.trim() || isSavingEmail ? "#858079" : "#FDFCF8",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: !newEmail.trim() || isSavingEmail ? "not-allowed" : "pointer",
                  }}
                >
                  {isSavingEmail ? "Sending..." : "Update Email"}
                </button>
              </div>
              <p style={{ margin: "6px 0 0", fontSize: 11.5, color: "#858079" }}>
                Better Auth will process your email change and send verification instructions if enabled.
              </p>
            </form>
          )}

          {emailStatus && (
            <div
              style={{
                marginTop: 8,
                fontSize: 12.5,
                color: emailStatus.type === "success" ? "#16A34A" : "#DC2626",
                fontWeight: 500,
              }}
            >
              {emailStatus.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

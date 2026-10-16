"use client";

import React, { useState } from "react";
import { authClient } from "@/lib/auth-client";

export interface SecurityCardProps {
  hasPassword: boolean;
  providers: string[];
}

export function SecurityCard({ hasPassword, providers }: SecurityCardProps) {
  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Reset password TODO modal/notice
  const [showResetNotice, setShowResetNotice] = useState(false);

  // Sessions state
  const [isRevokingSessions, setIsRevokingSessions] = useState(false);
  const [sessionsStatus, setSessionsStatus] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isChangingPassword) return;

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ message: "New passwords do not match", type: "error" });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordStatus({ message: "Password must be at least 8 characters long", type: "error" });
      return;
    }

    setIsChangingPassword(true);
    setPasswordStatus(null);

    try {
      const res = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      });

      if (res.error) {
        setPasswordStatus({
          message: res.error.message || "Failed to change password",
          type: "error",
        });
      } else {
        setPasswordStatus({
          message: "Password changed successfully",
          type: "success",
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to change password";
      setPasswordStatus({ message: msg, type: "error" });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleRevokeOtherSessions = async () => {
    if (isRevokingSessions) return;

    setIsRevokingSessions(true);
    setSessionsStatus(null);

    try {
      const res = await authClient.revokeOtherSessions();
      if (res.error) {
        setSessionsStatus({
          message: res.error.message || "Failed to sign out other sessions",
          type: "error",
        });
      } else {
        setSessionsStatus({
          message: "All other sessions have been signed out.",
          type: "success",
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to revoke sessions";
      setSessionsStatus({ message: msg, type: "error" });
    } finally {
      setIsRevokingSessions(false);
    }
  };

  const providerNames = providers
    .filter((p) => p !== "credential")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(", ");

  return (
    <div
      id="security"
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
      <div style={{ marginBottom: 20 }}>
        <h2
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 600,
            color: "#1A1917",
            letterSpacing: "-0.01em",
          }}
        >
          Security & Authentication
        </h2>
        <p
          style={{
            margin: "4px 0 0",
            fontSize: 13,
            color: "#6B6762",
          }}
        >
          Manage your password, login methods, and active browser sessions
        </p>
      </div>

      {/* Password Management */}
      {hasPassword ? (
        <form onSubmit={handleChangePassword} style={{ maxWidth: 480, marginBottom: 28 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
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
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                disabled={isChangingPassword}
                style={{
                  width: "100%",
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
            </div>

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
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                disabled={isChangingPassword}
                style={{
                  width: "100%",
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
            </div>

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
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
                disabled={isChangingPassword}
                style={{
                  width: "100%",
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
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
              <button
                type="submit"
                disabled={
                  isChangingPassword ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword
                }
                style={{
                  padding: "9px 18px",
                  borderRadius: 8,
                  border: "1px solid #1A1917",
                  background:
                    isChangingPassword || !currentPassword || !newPassword
                      ? "#EAE5DB"
                      : "#1A1917",
                  color:
                    isChangingPassword || !currentPassword || !newPassword
                      ? "#858079"
                      : "#FDFCF8",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor:
                    isChangingPassword || !currentPassword || !newPassword
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {isChangingPassword ? "Updating..." : "Update Password"}
              </button>

              <button
                type="button"
                onClick={() => setShowResetNotice(true)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#5549C0",
                  fontSize: 12.5,
                  fontWeight: 500,
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Forgot password?
              </button>
            </div>

            {passwordStatus && (
              <div
                style={{
                  marginTop: 6,
                  fontSize: 12.5,
                  color: passwordStatus.type === "success" ? "#16A34A" : "#DC2626",
                  fontWeight: 500,
                }}
              >
                {passwordStatus.message}
              </div>
            )}
          </div>
        </form>
      ) : (
        <div
          style={{
            padding: "16px 18px",
            borderRadius: 10,
            background: "#F5F2EC",
            border: "1px solid #E5E0D8",
            marginBottom: 28,
            maxWidth: 550,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>🔐</span>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "#1A1917" }}>
                You sign in with {providerNames || "Google"}
              </div>
              <div style={{ fontSize: 12.5, color: "#6B655D", marginTop: 2 }}>
                Your account is authenticated via your social provider. You do not need a separate password.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal / Notice (Strictly follows constraints) */}
      {showResetNotice && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: 8,
            background: "#FEF3C7",
            border: "1px solid #FCD34D",
            color: "#92400E",
            fontSize: 12.5,
            marginBottom: 24,
            maxWidth: 550,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <strong>Password Reset Flow Notice:</strong>
            <p style={{ margin: "4px 0 0" }}>
              Sending password reset emails requires an external email delivery provider (e.g., Resend or SendGrid) to be configured in your environment.
              <br />
              <em>TODO: Configure email-sending service (e.g. Resend) in <code>lib/auth.ts</code>.</em>
            </p>
          </div>
          <button
            onClick={() => setShowResetNotice(false)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#92400E",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            ✕
          </button>
        </div>
      )}

      <div style={{ height: 1, background: "#F0ECE4", marginBottom: 24 }} />

      {/* Session Management */}
      <div>
        <h3
          style={{
            margin: "0 0 4px",
            fontSize: 14.5,
            fontWeight: 600,
            color: "#1A1917",
          }}
        >
          Active Sessions
        </h3>
        <p
          style={{
            margin: "0 0 14px",
            fontSize: 12.5,
            color: "#6B6762",
          }}
        >
          Signed in on another browser or device? You can sign out of all other sessions with one click.
        </p>

        <button
          type="button"
          onClick={handleRevokeOtherSessions}
          disabled={isRevokingSessions}
          style={{
            padding: "8px 16px",
            borderRadius: 7,
            border: "1px solid #DED8CE",
            background: "#FBF9F5",
            color: "#1A1917",
            fontSize: 13,
            fontWeight: 500,
            cursor: isRevokingSessions ? "not-allowed" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {isRevokingSessions ? "Signing out..." : "Sign out of all other sessions"}
        </button>

        {sessionsStatus && (
          <div
            style={{
              marginTop: 10,
              fontSize: 12.5,
              color: sessionsStatus.type === "success" ? "#16A34A" : "#DC2626",
              fontWeight: 500,
            }}
          >
            {sessionsStatus.message}
          </div>
        )}
      </div>
    </div>
  );
}

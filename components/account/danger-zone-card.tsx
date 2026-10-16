"use client";

import React, { useState } from "react";
import { DeleteConfirmationModal } from "./delete-confirmation-modal";

export interface DangerZoneCardProps {
  hasPassword: boolean;
  onDataDeleted: (summary: {
    deletedCounts: Record<string, number>;
    revocations: Record<string, { revoked: boolean; error?: string }>;
  }) => void;
}

export function DangerZoneCard({ hasPassword, onDataDeleted }: DangerZoneCardProps) {
  const [activeModal, setActiveModal] = useState<"data" | "account" | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleDownloadData = async () => {
    setIsExporting(true);
    setExportError(null);

    try {
      const res = await fetch("/api/account/export");
      if (!res.ok) {
        throw new Error(`Failed to export data: ${res.statusText}`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nexus-data-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to export data";
      setExportError(msg);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      id="your-data"
      style={{
        background: "#FFFDFD",
        borderRadius: 14,
        border: "1px solid #FCA5A5",
        padding: "24px 28px",
        boxShadow: "0 1px 4px rgba(220, 38, 38, 0.05)",
        scrollMarginTop: 80,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h2
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 600,
                color: "#991B1B",
                letterSpacing: "-0.01em",
              }}
            >
              Your Data & Danger Zone
            </h2>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#DC2626",
                background: "#FEE2E2",
                border: "1px solid #FCA5A5",
                padding: "2px 8px",
                borderRadius: 12,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Danger Zone
            </span>
          </div>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 13,
              color: "#7F1D1D",
            }}
          >
            Export your personal data or execute irreversible data deletions
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* 1. Download My Data */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 18px",
            background: "#FFFFFF",
            borderRadius: 10,
            border: "1px solid #F3E8E8",
            gap: 16,
          }}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1A1917" }}>
              Download My Data
            </div>
            <div style={{ fontSize: 12.5, color: "#6B6762", marginTop: 2 }}>
              Export all your conversations, chat messages, and connected integration metadata in JSON format.
            </div>
            {exportError && (
              <div style={{ color: "#DC2626", fontSize: 12, marginTop: 4 }}>
                {exportError}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleDownloadData}
            disabled={isExporting}
            style={{
              padding: "8px 16px",
              borderRadius: 7,
              border: "1px solid #DED8CE",
              background: "#FBF9F5",
              color: "#1A1917",
              fontSize: 12.5,
              fontWeight: 500,
              cursor: isExporting ? "not-allowed" : "pointer",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {isExporting ? (
              <span>Exporting...</span>
            ) : (
              <>
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Download JSON</span>
              </>
            )}
          </button>
        </div>

        {/* 2. Delete My Data */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 18px",
            background: "#FFFFFF",
            borderRadius: 10,
            border: "1px solid #FEE2E2",
            gap: 16,
          }}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#991B1B" }}>
              Delete My Data
            </div>
            <div style={{ fontSize: 12.5, color: "#7F1D1D", marginTop: 2, maxWidth: 540 }}>
              Permanently wipes all synced emails, calendar events, AI memory, and integration permissions.
              Your account and login remain active.
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveModal("data")}
            style={{
              padding: "8px 16px",
              borderRadius: 7,
              border: "1px solid #FCA5A5",
              background: "#FFF5F5",
              color: "#DC2626",
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.12s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#DC2626";
              e.currentTarget.style.color = "#FFFFFF";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#FFF5F5";
              e.currentTarget.style.color = "#DC2626";
            }}
          >
            Delete My Data
          </button>
        </div>

        {/* 3. Delete My Account */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 18px",
            background: "#FFFFFF",
            borderRadius: 10,
            border: "1px solid #F87171",
            gap: 16,
          }}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#991B1B" }}>
              Delete My Account
            </div>
            <div style={{ fontSize: 12.5, color: "#7F1D1D", marginTop: 2, maxWidth: 540 }}>
              Permanently destroys your user account, login credentials, active sessions, and all data.
              This cannot be recovered.
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveModal("account")}
            style={{
              padding: "8px 16px",
              borderRadius: 7,
              border: "none",
              background: "#DC2626",
              color: "#FFFFFF",
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "background 0.12s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#B91C1C")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#DC2626")}
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {activeModal && (
        <DeleteConfirmationModal
          isOpen={true}
          mode={activeModal}
          hasPassword={hasPassword}
          onClose={() => setActiveModal(null)}
          onSuccess={(summary) => {
            onDataDeleted(summary);
          }}
        />
      )}
    </div>
  );
}

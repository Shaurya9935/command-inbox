"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppCategory, IntegrationApp, ConnectUser } from "./connect-types";
import { DEFAULT_INTEGRATIONS } from "./integrations-data";
import { ConnectCard } from "./connect-card";
import { ConnectModal } from "./connect-modal";
import { DisconnectModal } from "./disconnect-modal";

export interface ConnectWorkspaceProps {
  initialUser?: ConnectUser;
  initialStatuses?: Record<string, boolean>;
}

export function ConnectWorkspace({
  initialUser,
  initialStatuses = {},
}: ConnectWorkspaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState<ConnectUser | undefined>(initialUser);
  const [apps, setApps] = useState<IntegrationApp[]>(() => {
    // Check localStorage for simulated connections (Outlook, Slack, Notion)
    let savedLocal: Record<string, { connected: boolean; email?: string }> = {};
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("command_inbox_integrations");
        if (raw) savedLocal = JSON.parse(raw);
      } catch {}
    }

    return DEFAULT_INTEGRATIONS.map((app) => {
      // Real statuses from server
      const isServerConnected =
        app.id === "gmail"
          ? Boolean(initialStatuses.gmail)
          : app.id === "calendar"
          ? Boolean(initialStatuses.googlecalendar)
          : false;

      const local = savedLocal[app.id];
      const isConnected = isServerConnected || Boolean(local?.connected);

      return {
        ...app,
        connected: isConnected,
        connectedEmail: isConnected
          ? local?.email || initialUser?.email || "user@workspace.com"
          : undefined,
        lastSyncedAt: isConnected ? "Just now" : undefined,
      };
    });
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<AppCategory>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "connected" | "disconnected">("all");

  const [activeModal, setActiveModal] = useState<
    | { type: "connect"; app: IntegrationApp }
    | { type: "disconnect"; app: IntegrationApp }
    | null
  >(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch live status from API ──────────────────────────────────────────
  const fetchLiveStatus = async () => {
    try {
      const res = await fetch("/api/integrations/status");
      if (!res.ok) return;
      const data = await res.json();
      if (data.user) setUser(data.user);

      const statuses = data.statuses || {};
      const userEmail = data.email || data.user?.email;

      setApps((prev) =>
        prev.map((app) => {
          let isConnected = app.connected;
          let email = app.connectedEmail;

          if (app.id === "gmail") {
            isConnected = Boolean(statuses.gmail);
            if (isConnected && !email) email = userEmail;
          } else if (app.id === "calendar") {
            isConnected = Boolean(statuses.googlecalendar);
            if (isConnected && !email) email = userEmail;
          }

          return {
            ...app,
            connected: isConnected,
            connectedEmail: isConnected ? email : undefined,
          };
        })
      );
    } catch (err) {
      console.warn("Failed to fetch live integration statuses:", err);
    }
  };

  useEffect(() => {
    fetchLiveStatus();

    // Check query params for OAuth redirects like ?connected=gmail
    const connectedParam = searchParams.get("connected");
    if (connectedParam) {
      showToast(`Successfully connected ${connectedParam.toUpperCase()}!`, "success");
      // Clean query parameter without full reload
      router.replace("/dashboard/connect");
    }
  }, []);

  // Save state to localStorage for offline / mock integrations
  const persistLocalState = (appId: string, connected: boolean, email?: string) => {
    try {
      const raw = localStorage.getItem("command_inbox_integrations");
      const current = raw ? JSON.parse(raw) : {};
      current[appId] = { connected, email };
      localStorage.setItem("command_inbox_integrations", JSON.stringify(current));
    } catch {}
  };

  // ── Connect Flow ────────────────────────────────────────────────────────
  const handleInitiateConnect = async (app: IntegrationApp) => {
    if (app.canRealConnect && app.connectEndpoint) {
      // Real OAuth flow with backend endpoint
      setIsProcessing(true);
      try {
        showToast(`Preparing ${app.name} authorization…`, "info");
        const res = await fetch(app.connectEndpoint, { method: "POST" });
        const data = await res.json();
        if (data.connectUrl) {
          window.location.href = data.connectUrl;
          return;
        } else {
          showToast(data.error || "Failed to generate authorization URL", "error");
        }
      } catch (err) {
        showToast("Connection failed. Please check network.", "error");
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Interactive setup modal for Outlook, Slack, Notion, etc.
      setActiveModal({ type: "connect", app });
    }
  };

  const handleConfirmConnectModal = (app: IntegrationApp, accountEmail?: string) => {
    const finalEmail = accountEmail || user?.email || "connected@domain.com";

    setApps((prev) =>
      prev.map((item) =>
        item.id === app.id
          ? {
              ...item,
              connected: true,
              connectedEmail: finalEmail,
              lastSyncedAt: "Just now",
            }
          : item
      )
    );

    persistLocalState(app.id, true, finalEmail);
    setActiveModal(null);
    showToast(`Connected ${app.name} successfully!`, "success");
  };

  // ── Disconnect Flow ─────────────────────────────────────────────────────
  const handleInitiateDisconnect = (app: IntegrationApp) => {
    setActiveModal({ type: "disconnect", app });
  };

  const handleConfirmDisconnect = async () => {
    if (!activeModal || activeModal.type !== "disconnect") return;
    const app = activeModal.app;
    setIsProcessing(true);

    try {
      // Call backend disconnect API
      if (app.canRealConnect) {
        await fetch("/api/integrations/disconnect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plugin: app.pluginName || app.id }),
        });
      }

      setApps((prev) =>
        prev.map((item) =>
          item.id === app.id
            ? {
                ...item,
                connected: false,
                connectedEmail: undefined,
                lastSyncedAt: undefined,
              }
            : item
        )
      );

      persistLocalState(app.id, false, undefined);
      showToast(`Disconnected ${app.name}`, "info");
    } catch (err) {
      showToast("Error disconnecting integration", "error");
    } finally {
      setIsProcessing(false);
      setActiveModal(null);
    }
  };

  // ── Sync Flow ───────────────────────────────────────────────────────────
  const handleSyncApp = async (app: IntegrationApp) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    setApps((prev) =>
      prev.map((item) =>
        item.id === app.id ? { ...item, lastSyncedAt: "Just now" } : item
      )
    );
    showToast(`Synced ${app.name} events & messages`, "success");
  };

  // ── Computed Filtered Apps ──────────────────────────────────────────────
  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      // Category filter
      if (selectedCategory !== "all" && app.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (statusFilter === "connected" && !app.connected) return false;
      if (statusFilter === "disconnected" && app.connected) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = app.name.toLowerCase().includes(q);
        const matchesDesc = app.description.toLowerCase().includes(q);
        const matchesEmail = (app.connectedEmail || "").toLowerCase().includes(q);
        const matchesCaps = app.capabilities.some((c) => c.toLowerCase().includes(q));
        return matchesName || matchesDesc || matchesEmail || matchesCaps;
      }

      return true;
    });
  }, [apps, selectedCategory, statusFilter, searchQuery]);

  const connectedCount = apps.filter((a) => a.connected).length;
  const totalCount = apps.length;

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflowY: "auto",
        background: "#FDFCF8",
        fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
      }}
    >
      {/* ── Page Hero Header ─────────────────────────────────────────── */}
      <div
        style={{
          padding: "32px 36px 24px",
          borderBottom: "1px solid #EAE6DF",
          background: "linear-gradient(180deg, #FFFFFF 0%, #FAF8F4 100%)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* Title Row & Stats */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#5549C0",
                    background: "#EEEDF9",
                    padding: "3px 10px",
                    borderRadius: 20,
                    letterSpacing: "0.02em",
                  }}
                >
                  <svg width={13} height={13} viewBox="0 0 16 16" fill="none">
                    <path
                      d="M6 3.5a2.5 2.5 0 015 0V6h1.5A1.5 1.5 0 0114 7.5v6a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 012 13.5v-6A1.5 1.5 0 013.5 6H5V3.5z"
                      stroke="currentColor"
                      strokeWidth="1.3"
                    />
                  </svg>
                  App Connections
                </span>
                <span style={{ fontSize: 12, color: "#8E8880" }}>• Unified Workspace</span>
              </div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 26,
                  fontWeight: 700,
                  color: "#1A1917",
                  letterSpacing: "-0.02em",
                }}
              >
                Connected Apps & Integrations
              </h1>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: 13.5,
                  color: "#6B655D",
                  maxWidth: 680,
                  lineHeight: 1.5,
                }}
              >
                Manage your connected mailboxes, calendar schedules, team messaging, and productivity tools.
                All communications and notifications sync directly into your Command Inbox.
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: "#FFFFFF",
                padding: "8px 14px",
                borderRadius: 12,
                border: "1px solid #E5E0D8",
                boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#16A34A",
                    boxShadow: "0 0 0 2px rgba(22, 163, 74, 0.2)",
                  }}
                />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#1A1917" }}>
                  {connectedCount} Connected
                </span>
              </div>
              <span style={{ color: "#D1CBC1" }}>|</span>
              <span style={{ fontSize: 12.5, color: "#6B655D" }}>
                {totalCount} Total Available
              </span>
              <button
                onClick={fetchLiveStatus}
                title="Refresh all integration statuses"
                style={{
                  background: "transparent",
                  border: "1px solid #E5E0D8",
                  borderRadius: 6,
                  padding: "4px 8px",
                  fontSize: 11.5,
                  fontWeight: 500,
                  color: "#4A4642",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  marginLeft: 4,
                }}
              >
                <svg width={11} height={11} viewBox="0 0 16 16" fill="none">
                  <path d="M14 8A6 6 0 118 2a6 6 0 015.66 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  <path d="M14 2v4h-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Check
              </button>
            </div>
          </div>

          {/* Search and Category Filter Toolbar */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 14,
              paddingTop: 8,
            }}
          >
            {/* Category Filter Tabs */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                background: "#EFECE6",
                padding: "3px",
                borderRadius: 9,
              }}
            >
              {[
                { id: "all", label: "All Apps" },
                { id: "email", label: "Email" },
                { id: "calendar", label: "Calendar" },
                { id: "communication", label: "Team Chat" },
                { id: "productivity", label: "Productivity" },
              ].map((tab) => {
                const isActive = selectedCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedCategory(tab.id as AppCategory)}
                    style={{
                      padding: "6px 13px",
                      borderRadius: 7,
                      border: "none",
                      background: isActive ? "#FFFFFF" : "transparent",
                      color: isActive ? "#1A1917" : "#6E6860",
                      fontWeight: isActive ? 600 : 500,
                      fontSize: 12.5,
                      cursor: "pointer",
                      boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                      transition: "all 0.12s",
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Right: Search Box + Status Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              {/* Status Filter */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  background: "#EFECE6",
                  padding: "3px",
                  borderRadius: 9,
                }}
              >
                {[
                  { id: "all", label: "All" },
                  { id: "connected", label: `Connected (${connectedCount})` },
                  { id: "disconnected", label: `Not Connected (${totalCount - connectedCount})` },
                ].map((st) => {
                  const isSel = statusFilter === st.id;
                  return (
                    <button
                      key={st.id}
                      onClick={() => setStatusFilter(st.id as any)}
                      style={{
                        padding: "6px 11px",
                        borderRadius: 7,
                        border: "none",
                        background: isSel ? "#FFFFFF" : "transparent",
                        color: isSel ? "#1A1917" : "#6E6860",
                        fontWeight: isSel ? 600 : 500,
                        fontSize: 12,
                        cursor: "pointer",
                        boxShadow: isSel ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                        transition: "all 0.12s",
                      }}
                    >
                      {st.label}
                    </button>
                  );
                })}
              </div>

              {/* Search Bar */}
              <div
                style={{
                  position: "relative",
                  minWidth: 230,
                }}
              >
                <svg
                  width={14}
                  height={14}
                  viewBox="0 0 16 16"
                  fill="none"
                  style={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#9E9890",
                  }}
                >
                  <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search integrations…"
                  style={{
                    width: "100%",
                    padding: "7px 10px 7px 32px",
                    borderRadius: 8,
                    border: "1px solid #DED8CE",
                    background: "#FFFFFF",
                    fontSize: 12.5,
                    outline: "none",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    style={{
                      position: "absolute",
                      right: 8,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "transparent",
                      border: "none",
                      color: "#9E9890",
                      cursor: "pointer",
                      padding: 2,
                      fontSize: 11,
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Apps Card Grid ────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          width: "100%",
          padding: "32px 36px 48px",
          boxSizing: "border-box",
        }}
      >
        {filteredApps.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
              gap: 22,
            }}
          >
            {filteredApps.map((app) => (
              <ConnectCard
                key={app.id}
                app={app}
                onConnect={handleInitiateConnect}
                onDisconnect={handleInitiateDisconnect}
                onSync={handleSyncApp}
                isProcessing={isProcessing}
              />
            ))}
          </div>
        ) : (
          /* Empty Search State */
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              background: "#FFFFFF",
              border: "1px dashed #E5E0D8",
              borderRadius: 14,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "#F5F2EB",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#858079",
                marginBottom: 12,
              }}
            >
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8" />
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 600, color: "#1A1917" }}>
              No integrations match your filter
            </h3>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: "#78716C" }}>
              Try searching with different keywords or resetting category filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setStatusFilter("all");
              }}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid #D6D3CD",
                background: "#FFFFFF",
                fontSize: 12.5,
                fontWeight: 500,
                color: "#1A1917",
                cursor: "pointer",
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* ── Active Modals ────────────────────────────────────────────── */}
      {activeModal?.type === "connect" && (
        <ConnectModal
          app={activeModal.app}
          defaultEmail={user?.email}
          onConfirm={handleConfirmConnectModal}
          onCancel={() => setActiveModal(null)}
          isSubmitting={isProcessing}
        />
      )}

      {activeModal?.type === "disconnect" && (
        <DisconnectModal
          app={activeModal.app}
          onConfirm={handleConfirmDisconnect}
          onCancel={() => setActiveModal(null)}
          isSubmitting={isProcessing}
        />
      )}

      {/* ── Toast Notification ──────────────────────────────────────── */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 28,
            right: 28,
            zIndex: 200,
            background: toast.type === "error" ? "#EF4444" : toast.type === "info" ? "#3B82F6" : "#1A1917",
            color: "#FFFFFF",
            padding: "11px 18px",
            borderRadius: 10,
            boxShadow: "0 10px 25px rgba(0,0,0,0.18)",
            display: "flex",
            alignItems: "center",
            gap: 9,
            fontSize: 13,
            fontWeight: 500,
            animation: "toastIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {toast.type === "success" && (
            <svg width={15} height={15} viewBox="0 0 16 16" fill="none">
              <path d="M3 8.5l3.5 3.5 6.5-7" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          <span>{toast.message}</span>
        </div>
      )}

      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

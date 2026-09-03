"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  LogoIcon,
  InboxIcon,
  ChatIcon,
  StarIcon,
  DraftIcon,
  SendIcon,
  CalendarIcon,
  UpcomingIcon,
  SearchIcon,
  CommandIcon,
  SettingsIcon,
  HelpIcon,
  SidebarToggleIcon,
  LogoutIcon,
  BackIcon,
  GmailIcon,
  OutlookIcon,
  ChevronRightIcon,
  LabelIcon,
  TrashIcon,
  AllMailIcon,
  SpamIcon,
} from "./icons";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Avatar } from "./avatar";
import { UserProfile } from "./types";
import { CURRENT_USER } from "./mock-data";

export type WorkspaceId = "gmail" | "calendar" | "outlook";

export interface SidebarProps {
  activeNav: string;
  onSelectNav: (nav: string) => void;
  onOpenCalendar: () => void;
  onGoBack: () => void;
  user?: UserProfile;
  inboxBadge?: number;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

// ─── Primitive helpers ────────────────────────────────────────────────────────

type IconComponent = ({ className, size }: { className?: string; size?: number }) => React.JSX.Element;

function SectionLabel({ label, collapsed }: { label: string; collapsed: boolean }) {
  if (collapsed) return null;
  return (
    <div
      style={{
        fontSize: 9.5,
        fontWeight: 600,
        letterSpacing: "0.1em",
        color: "#B8B3AB",
        textTransform: "uppercase",
        padding: "0 10px",
        marginBottom: 3,
      }}
    >
      {label}
    </div>
  );
}

function NavBtn({
  icon: Icon,
  label,
  active = false,
  badge,
  collapsed = false,
  muted = false,
  onClick,
}: {
  icon: IconComponent;
  label: string;
  active?: boolean;
  badge?: number;
  collapsed?: boolean;
  muted?: boolean;
  onClick: () => void;
}) {
  const [hov, setHov] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title={collapsed ? label : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "flex-start",
        gap: collapsed ? 0 : 8,
        padding: collapsed ? "8px 0" : "6px 10px",
        borderRadius: 7,
        width: "100%",
        border: "none",
        cursor: "pointer",
        fontSize: muted ? 12.5 : 13,
        fontWeight: active ? 500 : 400,
        fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
        color: active ? "#5549C0" : hov ? "#1A1917" : muted ? "#9B9691" : "#6B6762",
        background: active ? "#EAE8F8" : hov ? "#EEEBE4" : "transparent",
        transition: "background 0.12s, color 0.12s",
        textAlign: "left",
        position: "relative",
      }}
    >
      <span
        style={{
          opacity: active ? 1 : muted ? 0.45 : 0.6,
          transition: "opacity 0.12s",
          display: "flex",
          position: "relative",
          flexShrink: 0,
        }}
      >
        <Icon />
        {/* Collapsed unread dot */}
        {collapsed && badge != null && badge > 0 && (
          <span
            style={{
              position: "absolute",
              top: -2,
              right: -3,
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#5549C0",
              border: "1.5px solid #EEE9E1",
            }}
          />
        )}
      </span>

      {!collapsed && <span style={{ flex: 1, whiteSpace: "nowrap" }}>{label}</span>}

      {!collapsed && badge != null && badge > 0 && (
        <span
          style={{
            fontSize: 10.5,
            fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
            color: active ? "#5549C0" : "#A8A49E",
            background: active ? "#D8D5F5" : "#E8E4DC",
            padding: "1px 6px",
            borderRadius: 20,
            lineHeight: "16px",
            flexShrink: 0,
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

/** Workspace row with a right-side chevron — used in main nav mode */
function WorkspaceRow({
  icon: Icon,
  label,
  active = false,
  onClick,
  collapsed = false,
}: {
  icon: IconComponent;
  label: string;
  active?: boolean;
  onClick: () => void;
  collapsed?: boolean;
}) {
  const [hov, setHov] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title={collapsed ? label : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "flex-start",
        gap: collapsed ? 0 : 8,
        padding: collapsed ? "8px 0" : "7px 10px",
        borderRadius: 7,
        width: "100%",
        border: "none",
        cursor: "pointer",
        fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
        background: active ? "#EAE8F8" : hov ? "#EEEBE4" : "transparent",
        transition: "background 0.12s",
        textAlign: "left",
      }}
    >
      {/* Icon */}
      <span
        style={{
          display: "flex",
          flexShrink: 0,
          color: active ? "#5549C0" : hov ? "#3E3A36" : "#6B6762",
          opacity: active ? 1 : 0.7,
          transition: "color 0.12s, opacity 0.12s",
        }}
      >
        <Icon size={14} />
      </span>

      {!collapsed && (
        <>
          <span
            style={{
              flex: 1,
              fontSize: 13,
              fontWeight: active ? 500 : 400,
              color: active ? "#5549C0" : hov ? "#1A1917" : "#4A4643",
              transition: "color 0.12s",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </span>
          <span
            style={{
              color: hov ? "#9B9691" : "#C5C0B9",
              display: "flex",
              transition: "color 0.12s, transform 0.15s",
              transform: hov ? "translateX(1px)" : "none",
              flexShrink: 0,
            }}
          >
            <ChevronRightIcon size={11} />
          </span>
        </>
      )}
    </button>
  );
}

/** Thin divider between sections */
function Divider() {
  return <div style={{ height: 1, background: "#E4DED4", margin: "8px 10px" }} />;
}

// ─── Animated Panel Wrapper ───────────────────────────────────────────────────

type PanelDir = "from-right" | "from-left";

function AnimatedPanel({
  children,
  panelKey,
  direction,
}: {
  children: React.ReactNode;
  panelKey: string;
  direction: PanelDir;
}) {
  const [mounted, setMounted] = useState(false);
  const prevKeyRef = useRef(panelKey);

  useEffect(() => {
    // Short delay so the initial translate has painted before we transition in
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Reset when key changes
  useEffect(() => {
    if (prevKeyRef.current !== panelKey) {
      prevKeyRef.current = panelKey;
      setMounted(false);
      const raf = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(raf);
    }
  });

  const initialX = direction === "from-right" ? 22 : -22;

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        transform: mounted ? "translateX(0)" : `translateX(${initialX}px)`,
        opacity: mounted ? 1 : 0,
        transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.18s ease",
      }}
    >
      {children}
    </div>
  );
}

// ─── Footer (shared) ──────────────────────────────────────────────────────────

function SidebarFooter({
  collapsed,
  handleToggle,
  displayUser,
  handleLogout,
}: {
  collapsed: boolean;
  handleToggle: () => void;
  displayUser: { name: string; email: string; initials: string; color: string };
  handleLogout: () => void;
}) {
  return (
    <div style={{ borderTop: "1px solid #E4DED4", paddingTop: 8 }}>
      {/* Collapse/Expand toggle */}
      <NavBtn
        icon={SidebarToggleIcon}
        label={collapsed ? "Expand" : "Collapse"}
        active={false}
        collapsed={collapsed}
        onClick={handleToggle}
      />
      <NavBtn icon={SettingsIcon} label="Settings" collapsed={collapsed} onClick={() => {}} />
      <NavBtn icon={HelpIcon} label="Help" collapsed={collapsed} onClick={() => {}} />

      {/* User row */}
      <div
        title={collapsed ? `${displayUser.name} (${displayUser.email})` : undefined}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          gap: 9,
          padding: collapsed ? "8px 0" : "10px 10px 2px",
          marginTop: 4,
          borderRadius: 8,
        }}
      >
        <Avatar initials={displayUser.initials} color={displayUser.color} size={26} />
        {!collapsed && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 12.5,
                fontWeight: 500,
                color: "#1A1917",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {displayUser.name}
            </div>
            <div
              style={{
                fontSize: 10.5,
                color: "#B8B3AB",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {displayUser.email}
            </div>
          </div>
        )}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        title={collapsed ? "Log out" : undefined}
        style={{
          width: "100%",
          marginTop: 8,
          padding: collapsed ? "6px 0" : "6px 10px",
          borderRadius: 7,
          border: "1px solid #E4DED4",
          background: "#FDFCF8",
          fontSize: 12.5,
          fontWeight: 500,
          color: "#6B6762",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          gap: collapsed ? 0 : 7,
          fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
          transition: "background 0.12s, color 0.12s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#F9EEE9";
          e.currentTarget.style.color = "#C53030";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#FDFCF8";
          e.currentTarget.style.color = "#6B6762";
        }}
      >
        <LogoutIcon size={14} />
        {!collapsed && <span>Log out</span>}
      </button>
    </div>
  );
}

// ─── Back header (shared across workspace panels) ─────────────────────────────

function WorkspacePanelHeader({
  label,
  onBack,
}: {
  label: string;
  onBack: () => void;
}) {
  const [hov, setHov] = useState(false);

  return (
    <button
      onClick={onBack}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "18px 10px 20px",
        background: "none",
        border: "none",
        cursor: "pointer",
        width: "100%",
        textAlign: "left",
        fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          color: hov ? "#5549C0" : "#9B9691",
          display: "flex",
          transition: "color 0.12s, transform 0.15s",
          transform: hov ? "translateX(-2px)" : "none",
        }}
      >
        <BackIcon size={13} />
      </span>
      <span
        style={{
          fontSize: 13.5,
          fontWeight: 600,
          color: "#1A1917",
          letterSpacing: "-0.02em",
        }}
      >
        {label}
      </span>
    </button>
  );
}

// ─── Context panels ───────────────────────────────────────────────────────────

function GmailPanel({
  activeNav,
  inboxBadge,
  otherWorkspaces,
  onSelectNav,
  onBack,
  onSwitchWorkspace,
}: {
  activeNav: string;
  inboxBadge: number;
  otherWorkspaces: { id: WorkspaceId; icon: IconComponent; label: string }[];
  onSelectNav: (nav: string) => void;
  onBack: () => void;
  onSwitchWorkspace: (id: WorkspaceId) => void;
}) {
  return (
    <>
      <WorkspacePanelHeader label="Gmail" onBack={onBack} />

      {/* Mail section */}
      <div style={{ marginBottom: 20 }}>
        <SectionLabel label="Mail" collapsed={false} />
        <NavBtn
          icon={InboxIcon}
          label="Inbox"
          active={activeNav === "inbox"}
          badge={inboxBadge}
          onClick={() => onSelectNav("inbox")}
        />
        <NavBtn
          icon={StarIcon}
          label="Starred"
          active={activeNav === "starred"}
          onClick={() => onSelectNav("starred")}
        />
        <NavBtn
          icon={DraftIcon}
          label="Drafts"
          active={activeNav === "drafts"}
          onClick={() => onSelectNav("drafts")}
        />
        <NavBtn
          icon={SendIcon}
          label="Sent"
          active={activeNav === "sent"}
          onClick={() => onSelectNav("sent")}
        />
        <NavBtn
          icon={AllMailIcon}
          label="All Mail"
          active={activeNav === "all-mail"}
          onClick={() => onSelectNav("all-mail")}
        />
        <NavBtn
          icon={SpamIcon}
          label="Spam"
          active={activeNav === "spam"}
          onClick={() => onSelectNav("spam")}
          muted
        />
        <NavBtn
          icon={TrashIcon}
          label="Trash"
          active={activeNav === "trash"}
          onClick={() => onSelectNav("trash")}
          muted
        />
      </div>

      {/* Labels section */}
      <div style={{ marginBottom: 20 }}>
        <SectionLabel label="Labels" collapsed={false} />
        {["Work", "Personal", "Projects"].map((lbl) => (
          <NavBtn
            key={lbl}
            icon={LabelIcon}
            label={lbl}
            active={activeNav === `label-${lbl.toLowerCase()}`}
            onClick={() => onSelectNav(`label-${lbl.toLowerCase()}`)}
          />
        ))}
      </div>

      {/* Other workspaces */}
      {otherWorkspaces.length > 0 && (
        <>
          <Divider />
          <div style={{ marginBottom: 8 }}>
            <SectionLabel label="Other Workspaces" collapsed={false} />
            {otherWorkspaces.map((w) => (
              <NavBtn
                key={w.id}
                icon={w.icon}
                label={w.label}
                muted
                onClick={() => onSwitchWorkspace(w.id)}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}

function CalendarPanel({
  activeNav,
  otherWorkspaces,
  onSelectNav,
  onBack,
  onSwitchWorkspace,
  router,
}: {
  activeNav: string;
  otherWorkspaces: { id: WorkspaceId; icon: IconComponent; label: string }[];
  onSelectNav: (nav: string) => void;
  onBack: () => void;
  onSwitchWorkspace: (id: WorkspaceId) => void;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <>
      <WorkspacePanelHeader label="Calendar" onBack={onBack} />

      <div style={{ marginBottom: 20 }}>
        <SectionLabel label="Calendar" collapsed={false} />
        <NavBtn
          icon={CalendarIcon}
          label="Today"
          active={activeNav === "today"}
          onClick={() => {
            onSelectNav("today");
            router.push("/dashboard/calendar");
          }}
        />
        <NavBtn
          icon={UpcomingIcon}
          label="Upcoming"
          active={activeNav === "upcoming"}
          onClick={() => {
            onSelectNav("upcoming");
            router.push("/dashboard/calendar");
          }}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <SectionLabel label="My Calendars" collapsed={false} />
        {["Personal", "Work"].map((cal) => (
          <NavBtn
            key={cal}
            icon={CalendarIcon}
            label={cal}
            active={activeNav === `cal-${cal.toLowerCase()}`}
            onClick={() => onSelectNav(`cal-${cal.toLowerCase()}`)}
          />
        ))}
      </div>

      {otherWorkspaces.length > 0 && (
        <>
          <Divider />
          <div style={{ marginBottom: 8 }}>
            <SectionLabel label="Other Workspaces" collapsed={false} />
            {otherWorkspaces.map((w) => (
              <NavBtn
                key={w.id}
                icon={w.icon}
                label={w.label}
                muted
                onClick={() => {
                  if (w.id === "gmail") {
                    router.push("/dashboard/inbox");
                  }
                  onSwitchWorkspace(w.id);
                }}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}

function OutlookPanel({
  activeNav,
  otherWorkspaces,
  onSelectNav,
  onBack,
  onSwitchWorkspace,
}: {
  activeNav: string;
  otherWorkspaces: { id: WorkspaceId; icon: IconComponent; label: string }[];
  onSelectNav: (nav: string) => void;
  onBack: () => void;
  onSwitchWorkspace: (id: WorkspaceId) => void;
}) {
  return (
    <>
      <WorkspacePanelHeader label="Outlook" onBack={onBack} />

      <div style={{ marginBottom: 20 }}>
        <SectionLabel label="Mail" collapsed={false} />
        <NavBtn
          icon={InboxIcon}
          label="Inbox"
          active={activeNav === "outlook-inbox"}
          onClick={() => onSelectNav("outlook-inbox")}
        />
        <NavBtn
          icon={StarIcon}
          label="Starred"
          active={activeNav === "outlook-starred"}
          onClick={() => onSelectNav("outlook-starred")}
        />
        <NavBtn
          icon={DraftIcon}
          label="Drafts"
          active={activeNav === "outlook-drafts"}
          onClick={() => onSelectNav("outlook-drafts")}
        />
        <NavBtn
          icon={SendIcon}
          label="Sent"
          active={activeNav === "outlook-sent"}
          onClick={() => onSelectNav("outlook-sent")}
        />
        <NavBtn
          icon={AllMailIcon}
          label="Archive"
          active={activeNav === "outlook-archive"}
          onClick={() => onSelectNav("outlook-archive")}
          muted
        />
        <NavBtn
          icon={TrashIcon}
          label="Trash"
          active={activeNav === "outlook-trash"}
          onClick={() => onSelectNav("outlook-trash")}
          muted
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <SectionLabel label="Folders" collapsed={false} />
        {["Work", "Personal", "Projects"].map((folder) => (
          <NavBtn
            key={folder}
            icon={LabelIcon}
            label={folder}
            active={activeNav === `outlook-folder-${folder.toLowerCase()}`}
            onClick={() => onSelectNav(`outlook-folder-${folder.toLowerCase()}`)}
          />
        ))}
      </div>

      {otherWorkspaces.length > 0 && (
        <>
          <Divider />
          <div style={{ marginBottom: 8 }}>
            <SectionLabel label="Other Workspaces" collapsed={false} />
            {otherWorkspaces.map((w) => (
              <NavBtn
                key={w.id}
                icon={w.icon}
                label={w.label}
                muted
                onClick={() => onSwitchWorkspace(w.id)}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}

// ─── Main nav panel ───────────────────────────────────────────────────────────

function MainNav({
  activeNav,
  inboxBadge,
  collapsed,
  onSelectNav,
  onOpenCalendar,
  onGoBack,
  onSelectWorkspace,
  router,
}: {
  activeNav: string;
  inboxBadge: number;
  collapsed: boolean;
  onSelectNav: (nav: string) => void;
  onOpenCalendar: () => void;
  onGoBack: () => void;
  onSelectWorkspace: (id: WorkspaceId) => void;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      {/* ── WORKSPACES ── */}
      <div style={{ marginBottom: collapsed ? 16 : 22 }}>
        <SectionLabel label="Workspaces" collapsed={collapsed} />
        <WorkspaceRow
          icon={GmailIcon}
          label="Gmail"
          onClick={() => onSelectWorkspace("gmail")}
          collapsed={collapsed}
        />
        <WorkspaceRow
          icon={CalendarIcon}
          label="Calendar"
          onClick={() => {
            onSelectWorkspace("calendar");
            router.push("/dashboard/calendar");
          }}
          collapsed={collapsed}
        />
        <WorkspaceRow
          icon={OutlookIcon}
          label="Outlook"
          onClick={() => onSelectWorkspace("outlook")}
          collapsed={collapsed}
        />
      </div>

      {!collapsed && <Divider />}

      {/* ── UNIFIED ── */}
      <div style={{ marginBottom: collapsed ? 16 : 22, marginTop: collapsed ? 0 : 4 }}>
        <SectionLabel label="Unified" collapsed={collapsed} />
        <NavBtn
          icon={ChatIcon}
          label="Chat"
          active={activeNav === "chat"}
          collapsed={collapsed}
          onClick={() => {
            onSelectNav("chat");
            onGoBack();
          }}
        />
        <NavBtn
          icon={InboxIcon}
          label="Inbox"
          active={activeNav === "inbox"}
          badge={inboxBadge}
          collapsed={collapsed}
          onClick={() => {
            onSelectNav("inbox");
            router.push("/dashboard/inbox");
          }}
        />
        <NavBtn
          icon={StarIcon}
          label="Starred"
          active={activeNav === "starred"}
          collapsed={collapsed}
          onClick={() => {
            onSelectNav("starred");
            onGoBack();
          }}
        />
        <NavBtn
          icon={CalendarIcon}
          label="Today"
          active={activeNav === "today"}
          collapsed={collapsed}
          onClick={() => {
            onOpenCalendar();
            router.push("/dashboard/calendar");
          }}
        />
        <NavBtn
          icon={UpcomingIcon}
          label="Upcoming"
          active={activeNav === "upcoming"}
          collapsed={collapsed}
          onClick={() => {
            onSelectNav("upcoming");
            router.push("/dashboard/calendar");
          }}
        />
      </div>

      {!collapsed && <Divider />}

      {/* ── TOOLS ── */}
      <div style={{ marginBottom: collapsed ? 16 : 8, marginTop: collapsed ? 0 : 4 }}>
        <SectionLabel label="Tools" collapsed={collapsed} />
        <NavBtn
          icon={SearchIcon}
          label="Search"
          active={activeNav === "search"}
          collapsed={collapsed}
          onClick={() => onSelectNav("search")}
        />
        <NavBtn
          icon={CommandIcon}
          label="Command"
          active={activeNav === "command"}
          collapsed={collapsed}
          onClick={() => onSelectNav("command")}
        />
      </div>
    </div>
  );
}

// ─── Sidebar root ─────────────────────────────────────────────────────────────

const WORKSPACE_META: Record<WorkspaceId, { icon: IconComponent; label: string }> = {
  gmail: { icon: GmailIcon, label: "Gmail" },
  calendar: { icon: CalendarIcon, label: "Calendar" },
  outlook: { icon: OutlookIcon, label: "Outlook" },
};

export function Sidebar({
  activeNav,
  onSelectNav,
  onOpenCalendar,
  onGoBack,
  user = CURRENT_USER,
  inboxBadge = 0,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  const router = useRouter();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceId | null>(null);
  const prevWorkspaceRef = useRef<WorkspaceId | null>(null);

  const isCollapsed = collapsed !== undefined ? collapsed : internalCollapsed;

  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed((prev) => !prev);
    }
    // Collapse workspace panel when collapsing sidebar
    if (!isCollapsed) setActiveWorkspace(null);
  };

  const handleSelectWorkspace = (id: WorkspaceId) => {
    // Collapsed mode: don't open context panel, just navigate
    if (isCollapsed) return;
    prevWorkspaceRef.current = activeWorkspace;
    setActiveWorkspace(id);
  };

  const handleSwitchWorkspace = (id: WorkspaceId) => {
    prevWorkspaceRef.current = activeWorkspace;
    setActiveWorkspace(id);
  };

  const handleBack = () => {
    prevWorkspaceRef.current = activeWorkspace;
    setActiveWorkspace(null);
  };

  const { data: session } = authClient.useSession();
  const displayUser = session?.user
    ? {
        name: session.user.name || session.user.email.split("@")[0],
        email: session.user.email,
        initials: (session.user.name || session.user.email)
          .split(" ")
          .map((w: string) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
        color: "#5549C0",
      }
    : user;

  async function handleLogout() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
          router.refresh();
        },
      },
    });
  }

  const otherWorkspaces = (Object.keys(WORKSPACE_META) as WorkspaceId[])
    .filter((id) => id !== activeWorkspace)
    .map((id) => ({ id, ...WORKSPACE_META[id] }));

  // Determine slide direction: going into a workspace slides from right, going back slides from left
  const panelDir: PanelDir = activeWorkspace !== null ? "from-right" : "from-left";
  // When switching between workspaces directly, slide from right
  const panelKey = activeWorkspace ?? "main";

  return (
    <aside
      style={{
        width: isCollapsed ? 60 : 210,
        flexShrink: 0,
        background: "#EEE9E1",
        borderRight: "1px solid #E4DED4",
        display: "flex",
        flexDirection: "column",
        padding: isCollapsed ? "0 6px 14px" : "0 10px 14px",
        overflowY: "hidden",
        transition: "width 0.22s cubic-bezier(0.4, 0, 0.2, 1), padding 0.22s",
      }}
    >
      {/* ── Brand ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: isCollapsed ? "center" : "flex-start",
          padding: isCollapsed ? "20px 0 20px" : "20px 8px 24px",
          flexShrink: 0,
        }}
      >
        <div
          onClick={isCollapsed ? handleToggle : undefined}
          title={isCollapsed ? "Expand sidebar" : undefined}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            cursor: isCollapsed ? "pointer" : "default",
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 7,
              background: "linear-gradient(140deg, #5549C0 0%, #7B6ED8 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(85,73,192,0.3)",
              flexShrink: 0,
            }}
          >
            <LogoIcon />
          </div>
          {!isCollapsed && (
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#1A1917",
                letterSpacing: "-0.025em",
                whiteSpace: "nowrap",
              }}
            >
              Command Inbox
            </span>
          )}
        </div>
      </div>

      {/* ── Nav body with animated panel transition ── */}
      {activeWorkspace === "gmail" && !isCollapsed ? (
        <AnimatedPanel panelKey={panelKey} direction={panelDir}>
          <GmailPanel
            activeNav={activeNav}
            inboxBadge={inboxBadge}
            otherWorkspaces={otherWorkspaces}
            onSelectNav={onSelectNav}
            onBack={handleBack}
            onSwitchWorkspace={handleSwitchWorkspace}
          />
        </AnimatedPanel>
      ) : activeWorkspace === "calendar" && !isCollapsed ? (
        <AnimatedPanel panelKey={panelKey} direction={panelDir}>
          <CalendarPanel
            activeNav={activeNav}
            otherWorkspaces={otherWorkspaces}
            onSelectNav={onSelectNav}
            onBack={handleBack}
            onSwitchWorkspace={handleSwitchWorkspace}
            router={router}
          />
        </AnimatedPanel>
      ) : activeWorkspace === "outlook" && !isCollapsed ? (
        <AnimatedPanel panelKey={panelKey} direction={panelDir}>
          <OutlookPanel
            activeNav={activeNav}
            otherWorkspaces={otherWorkspaces}
            onSelectNav={onSelectNav}
            onBack={handleBack}
            onSwitchWorkspace={handleSwitchWorkspace}
          />
        </AnimatedPanel>
      ) : (
        <AnimatedPanel panelKey={panelKey} direction={panelDir}>
          <MainNav
            activeNav={activeNav}
            inboxBadge={inboxBadge}
            collapsed={isCollapsed}
            onSelectNav={onSelectNav}
            onOpenCalendar={onOpenCalendar}
            onGoBack={onGoBack}
            onSelectWorkspace={handleSelectWorkspace}
            router={router}
          />
        </AnimatedPanel>
      )}

      {/* ── Footer ── */}
      <SidebarFooter
        collapsed={isCollapsed}
        handleToggle={handleToggle}
        displayUser={displayUser}
        handleLogout={handleLogout}
      />
    </aside>
  );
}

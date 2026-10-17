import type { ReactNode } from "react";
import type { SidebarItem } from "./types";
import { Sidebar } from "./sidebar";
import { ChatPanel } from "./chat-panel";

export function WindowFrame({
  children,
  approvalActive = false,
  sidebarActive = "Inbox",
}: {
  children: ReactNode;
  approvalActive?: boolean;
  sidebarActive?: SidebarItem;
}) {
  return (
    <div
      className="window-wrap"
      role="img"
      aria-label="Nexus AI command center product interface"
    >
      <div className="window-frame">
        <div className="window-bar">
          <div className="flex gap-1.5">
            <i className="bg-[var(--window-dot-red)]" />
            <i className="bg-[var(--window-dot-yellow)]" />
            <i className="bg-[var(--window-dot-green)]" />
          </div>
          <span className="absolute left-1/2 -translate-x-1/2 text-[10px] font-medium text-muted">
            Nexus
          </span>
          <span className="text-[8px] text-muted">Connected</span>
        </div>
        <div className="flex h-[calc(100%-38px)]">
          <Sidebar activeItem={sidebarActive} />
          <div className="relative min-w-0 flex-1 overflow-hidden bg-white">
            {children}
          </div>
        </div>
      </div>
      <ChatPanel active={approvalActive} />
    </div>
  );
}

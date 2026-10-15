import type { SidebarItem } from "./types";
import { SidebarIcon } from "./icons";

export function SidebarGroup({
  label,
  items,
  activeItem,
}: {
  label: string;
  items: SidebarItem[];
  activeItem: SidebarItem;
}) {
  return (
    <div>
      <p className="mt-5 mb-2 font-mono text-[10.5px] tracking-[0.14em] text-[rgba(22,21,26,0.4)] uppercase">
        {label}
      </p>
      <div className="grid gap-1">
        {items.map((item) => (
          <div
            key={item}
            className={`flex h-9 items-center gap-2.5 whitespace-nowrap rounded-[10px] px-2.5 text-[14px] transition-colors duration-200 ease-out ${
              activeItem === item
                ? "bg-tint font-medium text-accent"
                : "text-[rgba(22,21,26,0.65)] hover:bg-[#F3F1EA]"
            }`}
          >
            <SidebarIcon item={item} />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Sidebar({ activeItem = "Inbox" }: { activeItem?: SidebarItem }) {
  return (
    <aside className="hidden h-full w-[240px] shrink-0 flex-col border-r border-line bg-[#FBFAF7] p-4 sm:flex">
      <div className="flex h-6 items-center gap-2.5 whitespace-nowrap">
        <span className="grid size-6 shrink-0 place-items-center rounded-md bg-accent text-[12px] font-semibold text-white">
          &gt;
        </span>
        <span className="text-[15px] font-semibold leading-none">Nexus</span>
      </div>
      <button className="relative mt-5 flex h-10 w-full shrink-0 items-center justify-center whitespace-nowrap rounded-[10px] bg-accent px-3 text-[14px] font-medium text-white">
        <span className="flex items-center gap-2 text-white">
          <span className="text-[16px] leading-none text-white">+</span>
          <span className="text-white">New command</span>
        </span>
        <kbd className="absolute right-3 font-mono text-[11px] font-normal text-white">
          ⌘K
        </kbd>
      </button>
      <SidebarGroup
        label="Workspace"
        items={["Inbox", "Calendar", "Drafts"]}
        activeItem={activeItem}
      />
      <SidebarGroup
        label="Tools"
        items={["Search", "Commands", "Connections"]}
        activeItem={activeItem}
      />
      <div className="mt-auto flex min-w-0 items-center gap-2.5 border-t border-line pt-4">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-tint text-[10px] font-semibold text-accent">
          AM
        </span>
        <span className="min-w-0 leading-tight">
          <strong className="block truncate text-[13px] font-medium text-ink">
            Alex Morgan
          </strong>
          <span className="mt-0.5 block truncate text-[12px] text-muted">
            alex@acme.co
          </span>
        </span>
      </div>
    </aside>
  );
}

import type { SidebarItem } from "./types";

export function GithubIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4.5"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 .7a11.5 11.5 0 0 0-3.64 22.4c.58.1.79-.25.79-.56v-2.23c-3.22.7-3.9-1.36-3.9-1.36-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.57-.29-5.27-1.28-5.27-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.16 1.18A10.96 10.96 0 0 1 12 6.1c.98 0 1.95.13 2.87.39 2.2-1.49 3.16-1.18 3.16-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.71 5.39-5.29 5.68.42.36.78 1.07.78 2.16v3.25c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z" />
    </svg>
  );
}

export function SidebarIcon({ item }: { item: SidebarItem }) {
  const iconProps = {
    "aria-hidden": true,
    className: "size-4 shrink-0",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (item === "Inbox") {
    return (
      <svg {...iconProps}>
        <path d="M4 5.5h16l1.5 10.5a2 2 0 0 1-2 2.3h-15a2 2 0 0 1-2-2.3L4 5.5Z" />
        <path d="M3.2 14h4.4l1.5 2h5.8l1.5-2h4.4" />
      </svg>
    );
  }
  if (item === "Calendar") {
    return (
      <svg {...iconProps}>
        <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
        <path d="M7.5 3v4M16.5 3v4M3.5 9.5h17" />
      </svg>
    );
  }
  if (item === "Drafts") {
    return (
      <svg {...iconProps}>
        <path d="M13.5 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-7.5" />
        <path d="m15.5 3.5 5 5L11 18l-3 .5.5-3 9.5-9.5" />
      </svg>
    );
  }
  if (item === "Search") {
    return (
      <svg {...iconProps}>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m15.5 15.5 5 5" />
      </svg>
    );
  }
  if (item === "Commands") {
    return (
      <svg {...iconProps}>
        <rect x="3" y="4" width="18" height="16" rx="3" />
        <path d="m7.5 9 3 3-3 3M13 15h3.5" />
      </svg>
    );
  }
  return (
    <svg {...iconProps}>
      <path d="M8 12h8M9 8V4M15 8V4M7 8h10v3a5 5 0 0 1-10 0V8ZM12 16v4" />
    </svg>
  );
}

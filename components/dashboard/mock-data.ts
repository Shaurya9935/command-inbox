import {
  CalendarEvent,
  EventType,
  EventColorSpec,
  FocusItem,
  UserProfile,
  ServiceConnection,
} from "./types";

export const CURRENT_USER: UserProfile = {
  name: "Shaurya G.",
  email: "shaurya@work.io",
  initials: "SG",
  color: "var(--accent-text)",
};

export const EVENTS: CalendarEvent[] = [
  {
    time: "09:30",
    label: "Focus time",
    type: "focus",
    detail: "Deep work block",
  },
  {
    time: "11:00",
    label: "Team sync",
    type: "meeting",
    detail: "Google Meet",
    isNext: true,
  },
  {
    time: "13:00",
    label: "Lunch",
    type: "personal",
  },
  {
    time: "15:30",
    label: "Project review",
    type: "meeting",
    detail: "with Sarah & Alex",
  },
  {
    time: "18:00",
    label: "Gym",
    type: "personal",
  },
];

export const EVENT_COLORS: Record<EventType, EventColorSpec> = {
  focus: {
    line: "var(--event-focus-bar)",
    dot: "var(--event-focus-bar)",
    text: "var(--event-focus-text)",
    bg: "var(--event-focus-bg)",
    border: "var(--event-focus-border)",
  },
  meeting: {
    line: "var(--event-meeting-bar)",
    dot: "var(--event-meeting-bar)",
    text: "var(--event-meeting-text)",
    bg: "var(--event-meeting-bg)",
    border: "var(--event-meeting-border)",
  },
  personal: {
    line: "var(--event-personal-bar)",
    dot: "var(--event-personal-bar)",
    text: "var(--event-personal-text)",
    bg: "var(--event-personal-bg)",
    border: "var(--event-personal-border)",
  },
};

export const SUGGESTIONS: string[] = [
  "Show emails I need to reply to",
  "What's on my calendar today?",
  "Schedule a meeting with Alex",
  "Find unread emails from this week",
];

export const FOCUS_ITEMS: FocusItem[] = [
  { count: "12", label: "emails need attention", action: "email" },
  { count: "4", label: "meetings today", action: "calendar" },
  { count: "2", label: "drafts waiting", action: "email" },
  { count: "24m", label: "until Team sync", action: "calendar" },
];

export const SERVICE_CONNECTIONS: ServiceConnection[] = [
  { label: "Gmail", ok: true },
  { label: "Google Calendar", ok: true },
];

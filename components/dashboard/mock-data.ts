import {
  Email,
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
  color: "#5549C0",
};

export const EMAILS: Email[] = [
  {
    id: 1,
    from: "Sarah Chen",
    initials: "SC",
    color: "#8B72BE",
    subject: "Project update for tomorrow",
    preview:
      "Hey, just wanted to share the latest design revisions before our call. The new screens look great but I have a few notes on the flow.",
    time: "4:12 PM",
    unread: true,
    tag: "Needs reply",
  },
  {
    id: 2,
    from: "Alex Morgan",
    initials: "AM",
    color: "#5B8FAB",
    subject: "Can we move our meeting?",
    preview:
      "Would 3 PM work instead? I have a conflict earlier in the afternoon that just came up — totally fine if not.",
    time: "2:48 PM",
    unread: true,
    tag: "Needs reply",
  },
  {
    id: 3,
    from: "James Whitfield",
    initials: "JW",
    color: "#B07D4E",
    subject: "Invoice #2847 — due Friday",
    preview:
      "Please find attached the invoice for last month's work. Let me know if you need anything adjusted before Friday.",
    time: "9:05 AM",
    unread: false,
    tag: "Action needed",
  },
];

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
    line: "#8BAE92",
    dot: "#8BAE92",
    text: "#3E7868",
    bg: "#EEF4F0",
  },
  meeting: {
    line: "#7B72D4",
    dot: "#7B72D4",
    text: "#5549C0",
    bg: "#EDEAFB",
  },
  personal: {
    line: "#C5B49A",
    dot: "#C5B49A",
    text: "#7A6A50",
    bg: "#F7F2EB",
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

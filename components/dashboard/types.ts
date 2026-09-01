export type View = "default" | "email" | "calendar" | "command";

export type EventType = "focus" | "meeting" | "personal";

export interface Email {
  id: number | string;
  from: string;
  initials: string;
  color: string;
  subject: string;
  preview: string;
  time: string;
  unread: boolean;
  tag: string;
}

export interface CalendarEvent {
  time: string;
  label: string;
  type: EventType;
  detail?: string;
  isNext?: boolean;
}

export interface EventColorSpec {
  line: string;
  dot: string;
  text: string;
  bg: string;
}

export interface FocusItem {
  count: string;
  label: string;
  action: View;
}

export interface UserProfile {
  name: string;
  email: string;
  initials: string;
  color: string;
}

export interface ServiceConnection {
  label: string;
  ok: boolean;
}

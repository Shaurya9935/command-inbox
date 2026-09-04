export type CalViewType = "week" | "month" | "day" | "agenda";

export type EventType = "focus" | "meeting" | "personal";

export interface CalEvent {
  id: number | string;
  title: string;
  day: number; // 0=Mon … 6=Sun within displayed week
  startH: number; // decimal hours e.g. 11.5 = 11:30
  endH: number;
  type: EventType;
  location?: string;
  attendees?: string[];
  description?: string;
  startDateIso?: string; // ISO string of the event's start datetime
  endDateIso?: string; // ISO string of the event's end datetime
}

export interface WeekDay {
  label: string;
  dateNum: number;
  monthStr: string;
  isToday: boolean;
  fullDate?: Date;
}

export interface MonthCell {
  date: number;
  mlabel: string;
  inMonth: boolean;
  isToday?: boolean;
  key: string;
  fullDate?: Date;
}

export interface EventStyle {
  bg: string;
  border: string;
  text: string;
  bar: string;
}

export function fmtTime(h: number): string {
  const hr = Math.floor(h);
  const min = Math.round((h % 1) * 60);
  const ampm = hr >= 12 ? "PM" : "AM";
  const disp = hr > 12 ? hr - 12 : hr === 0 ? 12 : hr;
  return `${disp}:${min.toString().padStart(2, "0")} ${ampm}`;
}

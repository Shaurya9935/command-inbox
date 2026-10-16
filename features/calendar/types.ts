export interface CalendarEventResult {
  eventId: string;
  id: string;
  calendarId?: string;
  title: string;
  start: string;
  end: string;
  location: string | null;
  meetLink: string | null;
}

export type {
  EnrichedCalendarEvent,
  CreateCalendarEventInput,
} from "./server";

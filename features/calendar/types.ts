export interface CalendarEventResult {
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

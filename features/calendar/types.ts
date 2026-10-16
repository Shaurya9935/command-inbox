export interface CalendarEventResult {
  id: string;
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

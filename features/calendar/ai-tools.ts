import { z } from "zod";
import type { Tool } from "@openai/agents";
import type { ToolContext } from "@/lib/ai/types";
import { strictTool } from "@/lib/ai/strict-tool";
import { extractAndValidateEmail } from "@/lib/validation/email";
import {
  getEventsInRange,
  createCalendarEventWithMeet,
  deleteCalendarEvent,
} from "./server";
import type { CalendarEventResult } from "./types";

export function calendarTools(ctx: ToolContext): Tool<unknown>[] {
  const { tenantId, tenantCorsair } = ctx;

  // ── get_calendar_events ────────────────────────────────────────────────────
  const getCalendarEvents = strictTool({
    name: "get_calendar_events",
    description:
      "Return Google Calendar events in a date/time range. Dates must be ISO 8601 in Asia/Kolkata (+05:30). Each event includes its unique 'id'. Use for any request about meetings, schedule, or events today/this week.",
    parameters: z.object({
      startISO: z
        .string()
        .describe("Range start as ISO 8601 e.g. '2025-10-14T00:00:00+05:30'"),
      endISO: z
        .string()
        .describe("Range end as ISO 8601 e.g. '2025-10-14T23:59:59+05:30'"),
    }),
    execute: async ({ startISO, endISO }): Promise<string> => {
      try {
        const events: CalendarEventResult[] = await getEventsInRange({
          tenantId,
          tenantCorsair,
          startISO,
          endISO,
        });

        if (!events.length) {
          return JSON.stringify({ events: [], note: "no events in this range" });
        }
        return JSON.stringify({ events });
      } catch (err) {
        return JSON.stringify({ error: `Calendar API failed: ${String(err)}` });
      }
    },
  });

  // ── create_calendar_event ──────────────────────────────────────────────────
  const createCalendarEvent = strictTool({
    name: "create_calendar_event",
    description:
      "Create a Google Calendar event. Validates attendees and timing, then initiates event creation. If approval is required, notifies you that the action is waiting for approval. Do NOT use this tool when the user asks to delete, cancel, or remove an event.",
    parameters: z.object({
      title: z.string().describe("Title or summary of the calendar event"),
      startISO: z
        .string()
        .describe("Start time in ISO 8601 format in Asia/Kolkata timezone (+05:30) e.g. '2026-10-15T16:00:00+05:30'"),
      endISO: z
        .string()
        .describe("End time in ISO 8601 format in Asia/Kolkata timezone (+05:30) e.g. '2026-10-15T17:00:00+05:30'"),
      description: z.string().nullable().describe("Event description/notes or null"),
      location: z.string().nullable().describe("Event physical or virtual location or null"),
      attendeeEmails: z
        .array(z.string())
        .nullable()
        .describe("List of attendee real email addresses or null. All addresses must be valid, real addresses."),
      addMeetLink: z
        .boolean()
        .nullable()
        .describe("Whether to generate a Google Meet video conference link"),
    }),
    execute: async ({
      title,
      startISO,
      endISO,
      description,
      location,
      attendeeEmails,
      addMeetLink,
    }): Promise<string> => {
      // 1. Validate dates
      if (isNaN(new Date(startISO).getTime()) || isNaN(new Date(endISO).getTime())) {
        return JSON.stringify({
          error: "Invalid startISO or endISO date. Must be valid ISO 8601 strings.",
        });
      }

      // 2. Validate attendees
      const validAttendees: string[] = [];
      if (attendeeEmails && attendeeEmails.length > 0) {
        for (const email of attendeeEmails) {
          const check = extractAndValidateEmail(email);
          if (!check.valid || !check.email) {
            return JSON.stringify({ error: check.error });
          }
          validAttendees.push(check.email);
        }
      }

      try {
        const res = await createCalendarEventWithMeet({
          tenantCorsair,
          title,
          startISO,
          endISO,
          description,
          location,
          attendeeEmails: validAttendees,
          addMeetLink,
        });

        return JSON.stringify({
          created: true,
          title: res.title,
          start: res.start,
          end: res.end,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (
          (err instanceof Error && err.name === "PermissionRequiredError") ||
          msg.includes("waiting for the user's approval") ||
          msg.includes("approval")
        ) {
          // Return approval message as a normal tool result so model does not retry
          return JSON.stringify({
            status: "waiting_approval",
            message: msg,
          });
        }
        return JSON.stringify({ error: `Calendar event creation failed: ${msg}` });
      }
    },
  });

  // ── delete_calendar_event ──────────────────────────────────────────────────
  const deleteCalendarEventTool = strictTool({
    name: "delete_calendar_event",
    description:
      "Delete a Google Calendar event. Provide the unique eventId (obtained from get_calendar_events). If you only know the event title or time, call get_calendar_events first to find its eventId, then call this tool. If approval is required, notifies you that the action is waiting for approval.",
    parameters: z.object({
      eventId: z
        .string()
        .describe("The unique ID of the Google Calendar event to delete (e.g. from get_calendar_events)."),
      title: z
        .string()
        .nullable()
        .describe("Optional title or summary of the event being deleted for display/logging context"),
    }),
    execute: async ({ eventId, title }): Promise<string> => {
      let targetId = eventId.trim();

      // Fallback: if eventId is missing or the model accidentally passed the title as eventId,
      // search upcoming events in range to find the event's actual ID
      if (!targetId || targetId.includes(" ")) {
        const now = new Date();
        const pastWeek = new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString();
        const futureMonth = new Date(now.getTime() + 30 * 24 * 3600 * 1000).toISOString();
        try {
          const events = await getEventsInRange({
            tenantId,
            tenantCorsair,
            startISO: pastWeek,
            endISO: futureMonth,
          });
          const query = (title || targetId).toLowerCase();
          const match = events.find((e) => e.title.toLowerCase().includes(query));
          if (match && match.id) {
            targetId = match.id;
          }
        } catch {
          // ignore lookup error and proceed with targetId
        }
      }

      if (!targetId) {
        return JSON.stringify({
          error: "Could not find eventId to delete. Please use get_calendar_events to locate the event first.",
        });
      }

      try {
        const res = await deleteCalendarEvent({
          tenantCorsair,
          eventId: targetId,
          tenantId,
        });

        return JSON.stringify({
          deleted: true,
          eventId: res.id,
          title: title || undefined,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (
          (err instanceof Error && err.name === "PermissionRequiredError") ||
          msg.includes("waiting for the user's approval") ||
          msg.includes("approval")
        ) {
          return JSON.stringify({
            status: "waiting_approval",
            message: msg,
          });
        }
        return JSON.stringify({ error: `Calendar event deletion failed: ${msg}` });
      }
    },
  });

  return [getCalendarEvents, createCalendarEvent, deleteCalendarEventTool];
}

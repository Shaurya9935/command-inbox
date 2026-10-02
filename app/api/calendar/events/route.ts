import {
  getCalendarEvents,
  syncCalendarEventsFromApi,
  createCalendarEvent,
} from "@/features/calendar/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/calendar/events
 *   – Serves calendar events from the local Corsair DB (fast, no rate limits).
 *
 * GET /api/calendar/events?sync=1
 *   – Fetches fresh events from Google Calendar API, upserts them to DB,
 *     and returns the latest events.
 */
export async function GET(req: NextRequest) {
  try {
    const wantsSync = req.nextUrl.searchParams.get("sync") === "1";

    if (wantsSync) {
      const events = await syncCalendarEventsFromApi();
      return NextResponse.json(events);
    }

    const events = await getCalendarEvents();
    return NextResponse.json(events);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[calendar/events]", error);
    return NextResponse.json({ error: "Failed to fetch calendar events" }, { status: 500 });
  }
}

/**
 * POST /api/calendar/events
 *   – Creates a new calendar event on Google Calendar and caches it in Corsair DB.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      summary,
      title,
      description,
      location,
      start,
      end,
      attendees,
      startDateIso,
      endDateIso,
    } = body;

    const eventSummary = summary || title;
    if (!eventSummary || typeof eventSummary !== "string" || !eventSummary.trim()) {
      return NextResponse.json({ error: "Title or summary is required" }, { status: 400 });
    }

    const startObj =
      start && (start.dateTime || start.date)
        ? start
        : { dateTime: startDateIso || new Date().toISOString() };
    const endObj =
      end && (end.dateTime || end.date)
        ? end
        : { dateTime: endDateIso || new Date(Date.now() + 3600000).toISOString() };

    const formattedAttendees = Array.isArray(attendees)
      ? attendees
          .map((a: unknown) => {
            if (typeof a === "string" && a.trim()) {
              return { email: a.trim() };
            }
            if (
              a &&
              typeof a === "object" &&
              "email" in a &&
              typeof (a as { email?: unknown }).email === "string"
            ) {
              return {
                email: ((a as { email: string }).email).trim(),
                displayName: (a as { displayName?: string }).displayName,
              };
            }
            return null;
          })
          .filter((a): a is { email: string; displayName?: string } => a !== null)
      : undefined;

    const createdEvent = await createCalendarEvent({
      summary: eventSummary.trim(),
      description: typeof description === "string" ? description.trim() : undefined,
      location: typeof location === "string" ? location.trim() : undefined,
      start: startObj,
      end: endObj,
      attendees: formattedAttendees?.length ? formattedAttendees : undefined,
    });

    return NextResponse.json(createdEvent, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[calendar/events:POST]", error);
    return NextResponse.json(
      { error: message || "Failed to create calendar event" },
      { status: 500 }
    );
  }
}

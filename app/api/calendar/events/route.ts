import { getCalendarEvents, syncCalendarEventsFromApi } from "@/features/calendar/server";
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

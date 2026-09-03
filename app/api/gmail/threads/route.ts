import { getInboxThreads, syncInboxThreadsFromApi } from "@/features/gmail/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/gmail/threads
 *   – Serves threads from the local Corsair DB (fast, no rate limits).
 *     from/subject/unread will be empty until a sync has run.
 *
 * GET /api/gmail/threads?sync=1
 *   – Fetches live from the Gmail API, enriches each thread with from/subject/date/unread,
 *     upserts basic metadata to the DB, and returns the fully enriched list.
 *     Used by the 15-min auto-refresh and the manual refresh button.
 */
export async function GET(req: NextRequest) {
  try {
    const wantsSync = req.nextUrl.searchParams.get("sync") === "1";

    if (wantsSync) {
      // Return fully enriched threads straight from the API — no stale DB data
      const enrichedThreads = await syncInboxThreadsFromApi();
      return NextResponse.json(enrichedThreads);
    }

    // Cold read from DB (fast, may not have from/subject yet)
    const threads = await getInboxThreads();
    return NextResponse.json(threads);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[gmail/threads]", error);
    return NextResponse.json({ error: "Failed to fetch Inbox" }, { status: 500 });
  }
}
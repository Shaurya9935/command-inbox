import { getInboxThreads, syncInboxThreadsFromApi } from "@/features/gmail/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/gmail/threads
 *   – Serves threads from the local Corsair DB (fast, no rate limits).
 *
 * GET /api/gmail/threads?sync=1
 *   – First syncs from the Gmail API (enriches + upserts to DB), then returns
 *     the refreshed list. Used by the 15-min auto-refresh and manual refresh button.
 */
export async function GET(req: NextRequest) {
  try {
    const wantsSync = req.nextUrl.searchParams.get("sync") === "1";

    if (wantsSync) {
      await syncInboxThreadsFromApi();
    }

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
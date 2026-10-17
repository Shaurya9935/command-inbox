import { getInboxThreads, syncInboxThreadsFromApi, getGmailAccountId } from "@/features/gmail/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/gmail/threads
 *   – Serves threads from the local Corsair DB (fast, no rate limits).
 *     from/subject/unread will be empty until a sync has run.
 *
 * GET /api/gmail/threads?sync=1
 *   – Fetches live from the Gmail API, enriches each thread with from/subject/date/unread,
 *     upserts basic metadata to the DB, and returns the fully enriched list.
 *     The server skips the live request when a successful sync is under 15 min old.
 *
 * GET /api/gmail/threads?sync=1&force=1
 *   – Bypasses the 15-min guard for an explicit user refresh.
 */
export async function GET(req: NextRequest) {
  try {
    const wantsSync = req.nextUrl.searchParams.get("sync") === "1";
    const force = req.nextUrl.searchParams.get("force") === "1";

    if (wantsSync) {
      const enrichedThreads = await syncInboxThreadsFromApi(10, { force });
      return NextResponse.json(enrichedThreads);
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = await getGmailAccountId(session.user.id);
    if (!accountId) {
      return NextResponse.json(
        { error: "Gmail is not connected for this user", notConnected: true },
        { status: 404 }
      );
    }

    // Cold read from DB (fast, may not have from/subject yet)
    const threads = await getInboxThreads();
    return NextResponse.json(threads);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (message.includes("not connected")) {
      return NextResponse.json({ error: message, notConnected: true }, { status: 404 });
    }
    console.error("[gmail/threads]", error);
    return NextResponse.json({ error: "Failed to fetch Inbox" }, { status: 500 });
  }
}

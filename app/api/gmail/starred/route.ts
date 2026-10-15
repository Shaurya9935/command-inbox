import { auth } from "@/lib/auth";
import { getStarredThreads, unstarThread, toggleStarThread } from "@/features/gmail/server";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 25;
    const pageToken = searchParams.get("pageToken") || undefined;
    const cachedOnly = searchParams.get("cached") === "1";

    const result = await getStarredThreads(session.user.id, {
      limit: Number.isNaN(limit) ? 25 : limit,
      pageToken,
      cachedOnly,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (message.includes("not connected")) {
      return NextResponse.json({ error: message, notConnected: true }, { status: 404 });
    }
    console.error("[gmail/starred GET]", error);
    return NextResponse.json({ error: "Failed to fetch starred threads" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const threadId = body?.threadId || req.nextUrl.searchParams.get("threadId");

    if (!threadId) {
      return NextResponse.json({ error: "threadId is required" }, { status: 400 });
    }

    const starred = typeof body?.starred === "boolean" ? body.starred : false;
    const result = await toggleStarThread(session.user.id, threadId, starred);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[gmail/starred POST]", error);
    return NextResponse.json({ error: message || "Failed to update star" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const threadId = req.nextUrl.searchParams.get("threadId") || body?.threadId;

    if (!threadId) {
      return NextResponse.json({ error: "threadId is required" }, { status: 400 });
    }

    const result = await unstarThread(session.user.id, threadId);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[gmail/starred DELETE]", error);
    return NextResponse.json({ error: message || "Failed to unstar thread" }, { status: 500 });
  }
}

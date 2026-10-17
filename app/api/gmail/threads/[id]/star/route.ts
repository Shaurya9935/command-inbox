import { auth } from "@/lib/auth";
import { unstarThread, toggleStarThread } from "@/features/gmail/server";
import { log } from "@/lib/logger";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Thread ID is required" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const starred = typeof body?.starred === "boolean" ? body.starred : false;

    const result = await toggleStarThread(session.user.id, id, starred);
    return NextResponse.json(result);
  } catch (error) {
    log.error("[gmail/threads/[id]/star POST] Error toggling star", { error });
    return NextResponse.json({ error: "Failed to toggle star" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Thread ID is required" }, { status: 400 });
    }

    const result = await unstarThread(session.user.id, id);
    return NextResponse.json(result);
  } catch (error) {
    log.error("[gmail/threads/[id]/star DELETE] Error unstarring thread", { error });
    return NextResponse.json({ error: "Failed to unstar thread" }, { status: 500 });
  }
}

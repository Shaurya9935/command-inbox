import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { userOnboarding } from "@/db/onboarding";
import { log } from "@/lib/logger";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const records = await db
      .select()
      .from(userOnboarding)
      .where(eq(userOnboarding.userId, session.user.id));

    if (records.length === 0) {
      return NextResponse.json({
        completed: false,
        skipped: false,
        completedAt: null,
        skippedAt: null,
      });
    }

    const record = records[0];
    return NextResponse.json({
      completed: Boolean(record.completedAt),
      skipped: Boolean(record.skippedAt),
      completedAt: record.completedAt ? record.completedAt.toISOString() : null,
      skippedAt: record.skippedAt ? record.skippedAt.toISOString() : null,
    });
  } catch (err) {
    log.error("[api/onboarding] GET error", { error: err });
    return NextResponse.json({ error: "Failed to fetch onboarding status" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { action } = body as { action?: "complete" | "skip" };

    if (action !== "complete" && action !== "skip") {
      return NextResponse.json(
        { error: 'Valid action ("complete" | "skip") is required' },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    const now = new Date();

    const existing = await db
      .select()
      .from(userOnboarding)
      .where(eq(userOnboarding.userId, userId));

    if (existing.length > 0) {
      const current = existing[0];
      await db
        .update(userOnboarding)
        .set({
          completedAt: action === "complete" ? now : current.completedAt,
          skippedAt: action === "skip" ? now : current.skippedAt,
          updatedAt: now,
        })
        .where(eq(userOnboarding.id, current.id));
    } else {
      await db.insert(userOnboarding).values({
        id: "onb_" + crypto.randomUUID().replace(/-/g, ""),
        userId,
        completedAt: action === "complete" ? now : null,
        skippedAt: action === "skip" ? now : null,
        createdAt: now,
        updatedAt: now,
      });
    }

    return NextResponse.json({
      success: true,
      action,
      timestamp: now.toISOString(),
    });
  } catch (err) {
    log.error("[api/onboarding] POST error", { error: err });
    return NextResponse.json({ error: "Failed to update onboarding status" }, { status: 500 });
  }
}

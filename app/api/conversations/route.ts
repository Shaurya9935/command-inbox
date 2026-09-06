import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { randomUUID } from "crypto";
import { and, eq, desc } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { conversations } from "@/lib/schema";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = await db
      .select({
        id: conversations.id,
        title: conversations.title,
        createdAt: conversations.createdAt,
        updatedAt: conversations.updatedAt,
      })
      .from(conversations)
      .where(eq(conversations.userId, session.user.id))
      .orderBy(desc(conversations.updatedAt));

    return NextResponse.json(items);
  } catch (error) {
    console.error("Failed to list conversations:", error);
    return NextResponse.json(
      { error: "Failed to list conversations" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversationId = randomUUID();

    const [conversation] = await db
      .insert(conversations)
      .values({
        id: conversationId,
        userId: session.user.id,
        title: null,
        agentHistory: [],
      })
      .returning({
        id: conversations.id,
        title: conversations.title,
        createdAt: conversations.createdAt,
        updatedAt: conversations.updatedAt,
      });

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("Failed to create conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}

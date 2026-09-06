import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { conversations, chatMessages } from "@/lib/schema";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const [conversation] = await db
      .select({ id: conversations.id })
      .from(conversations)
      .where(
        and(
          eq(conversations.id, id),
          eq(conversations.userId, session.user.id)
        )
      )
      .limit(1);

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Delete all messages
    await db.delete(chatMessages).where(eq(chatMessages.conversationId, id));

    // Reset agentHistory to empty array and update timestamp
    await db
      .update(conversations)
      .set({
        agentHistory: [],
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to clear conversation:", error);
    return NextResponse.json(
      { error: "Failed to clear conversation" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { and, eq, asc } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { conversations, chatMessages } from "@/lib/schema";

export async function GET(
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
      .select({
        id: conversations.id,
        title: conversations.title,
        createdAt: conversations.createdAt,
        updatedAt: conversations.updatedAt,
      })
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

    const messages = await db
      .select({
        id: chatMessages.id,
        role: chatMessages.role,
        content: chatMessages.content,
        createdAt: chatMessages.createdAt,
      })
      .from(chatMessages)
      .where(eq(chatMessages.conversationId, id))
      .orderBy(asc(chatMessages.createdAt));

    return NextResponse.json({ ...conversation, messages });
  } catch (error) {
    console.error("Failed to load conversation:", error);
    return NextResponse.json(
      { error: "Failed to load conversation" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Delete messages explicitly just in case cascade is missing
    await db.delete(chatMessages).where(eq(chatMessages.conversationId, id));
    
    await db
      .delete(conversations)
      .where(
        and(
          eq(conversations.id, id),
          eq(conversations.userId, session.user.id)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete conversation:", error);
    return NextResponse.json(
      { error: "Failed to delete conversation" },
      { status: 500 }
    );
  }
}

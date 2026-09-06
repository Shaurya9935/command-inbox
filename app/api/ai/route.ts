import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { randomUUID } from "crypto";
import { and, eq, asc, desc } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  conversations,
  chatMessages,
} from "@/lib/schema";

import { runCommand } from "@/lib/ai/agent";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversationId = new URL(request.url).searchParams.get("conversationId");
    if (!conversationId) {
      return NextResponse.json({ error: "Conversation ID is required" }, { status: 400 });
    }

    const [conversation] = await db
      .select({ id: conversations.id })
      .from(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          eq(conversations.userId, session.user.id),
        ),
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
      .where(eq(chatMessages.conversationId, conversationId))
      .orderBy(asc(chatMessages.createdAt));

    return NextResponse.json({ conversationId, messages });
  } catch (error) {
    console.error("AI conversation history error:", error);
    return NextResponse.json(
      { error: "Failed to load conversation history" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();

    const message = body.message;
    let conversationId = body.conversationId;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    // Create a new conversation if this is the first message
    if (!conversationId) {
      conversationId = randomUUID();

      await db.insert(conversations).values({
        id: conversationId,
        userId: session.user.id,
        title: message.slice(0, 80),
      });
    }

    // Make sure this conversation belongs to this user
    const [conversation] = await db
      .select({
        id: conversations.id,
      })
      .from(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          eq(conversations.userId, session.user.id),
        ),
      )
      .limit(1);

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    // Load previous chat messages
    const previousMessages = await db
      .select({
        role: chatMessages.role,
        content: chatMessages.content,
      })
      .from(chatMessages)
      .where(
        eq(chatMessages.conversationId, conversationId),
      )
      .orderBy(desc(chatMessages.createdAt))
      .limit(10);

    const history = previousMessages.reverse();

    // Save current user message
    await db.insert(chatMessages).values({
      id: randomUUID(),
      conversationId,
      role: "user",
      content: message,
    });

    // Give previous conversation to the agent
    const response = await runCommand({
      tenantId: session.user.id,
      message,
      history: history.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
    });

    // Save assistant response
    await db.insert(chatMessages).values({
      id: randomUUID(),
      conversationId,
      role: "assistant",
      content: response,
    });

    // Update conversation timestamp
    await db
      .update(conversations)
      .set({
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, conversationId));

    return NextResponse.json({
      conversationId,
      response,
    });
  } catch (error) {
    console.error("AI route error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

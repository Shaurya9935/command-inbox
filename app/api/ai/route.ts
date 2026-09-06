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
        title: message.slice(0, 40),
        agentHistory: [],
      });
    }

    // Make sure this conversation belongs to this user
    const [conversation] = await db
      .select({
        id: conversations.id,
        agentHistory: conversations.agentHistory,
        title: conversations.title,
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
    
    // Set title on first message if not set
    let updatedTitle = conversation.title;
    if (!updatedTitle) {
      updatedTitle = message.slice(0, 40);
    }

    // Save current user message
    await db.insert(chatMessages).values({
      id: randomUUID(),
      conversationId,
      role: "user",
      content: message,
    });

    const currentAgentHistory = conversation.agentHistory as any[] || [];

    // Give previous conversation to the agent
    const { response, newItems } = await runCommand({
      tenantId: session.user.id,
      message,
      agentHistory: currentAgentHistory,
    });

    // Update agent history by appending user message and new items
    const nextAgentHistory = [
      ...currentAgentHistory,
      {
        role: "user",
        content: message,
      },
      ...newItems,
    ];

    // Save assistant response
    await db.insert(chatMessages).values({
      id: randomUUID(),
      conversationId,
      role: "assistant",
      content: response,
    });

    // Update conversation timestamp and history
    await db
      .update(conversations)
      .set({
        title: updatedTitle,
        agentHistory: nextAgentHistory,
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

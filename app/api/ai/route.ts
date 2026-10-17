import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { randomUUID } from "crypto";
import { and, eq, asc, desc, sql, gte } from "drizzle-orm";
import { runCommand, type ChatTurn } from "@/lib/ai/agent";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { conversations, chatMessages, aiUsage } from "@/lib/schema";
import { log } from "@/lib/logger";

export const maxDuration = 60;

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversationId = new URL(request.url).searchParams.get(
      "conversationId",
    );
    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID is required" },
        { status: 400 },
      );
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
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
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
    log.error("AI conversation history error", { error });
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // 1. Reject messages longer than 2,000 characters
    if (message.length > 2000) {
      return NextResponse.json(
        { error: "Message is too long. Please keep messages under 2,000 characters." },
        { status: 400 },
      );
    }

    const today = new Date().toISOString().split("T")[0];

    // 2. Global soft cap: AI_DAILY_TOKEN_BUDGET_TOTAL (default 2,000,000)
    const globalTokenBudget = parseInt(
      process.env.AI_DAILY_TOKEN_BUDGET_TOTAL || "2000000",
      10,
    );
    const [globalUsage] = await db
      .select({
        totalIn: sql<number>`coalesce(sum(${aiUsage.tokensIn}), 0)`,
        totalOut: sql<number>`coalesce(sum(${aiUsage.tokensOut}), 0)`,
      })
      .from(aiUsage)
      .where(eq(aiUsage.day, today));

    const totalTokensToday =
      Number(globalUsage?.totalIn || 0) + Number(globalUsage?.totalOut || 0);
    if (totalTokensToday >= globalTokenBudget) {
      return NextResponse.json(
        { error: "The beta is at capacity today, try again tomorrow" },
        { status: 429 },
      );
    }

    // 3. User daily message limit: AI_DAILY_MESSAGE_LIMIT (default 50)
    const dailyLimit = parseInt(
      process.env.AI_DAILY_MESSAGE_LIMIT || "50",
      10,
    );
    const [todayUsage] = await db
      .select({ messages: aiUsage.messages })
      .from(aiUsage)
      .where(
        and(eq(aiUsage.userId, session.user.id), eq(aiUsage.day, today)),
      )
      .limit(1);

    if (todayUsage && todayUsage.messages >= dailyLimit) {
      return NextResponse.json(
        {
          error:
            "You have reached your daily message limit for the beta. Please try again tomorrow!",
        },
        { status: 429 },
      );
    }

    // 4. User burst limit: 8 messages per minute counted from chat_messages
    const burstLimit = parseInt(
      process.env.AI_BURST_MESSAGE_LIMIT || "8",
      10,
    );
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const [burstCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(chatMessages)
      .innerJoin(
        conversations,
        eq(chatMessages.conversationId, conversations.id),
      )
      .where(
        and(
          eq(conversations.userId, session.user.id),
          eq(chatMessages.role, "user"),
          gte(chatMessages.createdAt, oneMinuteAgo),
        ),
      );

    if (Number(burstCount?.count || 0) >= burstLimit) {
      return NextResponse.json(
        {
          error:
            "You're sending messages too quickly. Please pause for a moment before sending another.",
        },
        { status: 429 },
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

    // Load the last 8 turns BEFORE saving the new message
    const recent = await db
      .select({ role: chatMessages.role, content: chatMessages.content })
      .from(chatMessages)
      .where(eq(chatMessages.conversationId, conversationId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(8);

    const history = recent.reverse() as ChatTurn[];

    const {
      response,
      pendingActions,
      tokensIn = 0,
      tokensOut = 0,
    } = await runCommand({
      tenantId: session.user.id,
      conversationId,
      message,
      history,
    });

    // Atomically upsert ai_usage with increment
    await db
      .insert(aiUsage)
      .values({
        id: `usage_${session.user.id}_${today}`,
        userId: session.user.id,
        day: today,
        messages: 1,
        tokensIn,
        tokensOut,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [aiUsage.userId, aiUsage.day],
        set: {
          messages: sql`${aiUsage.messages} + 1`,
          tokensIn: sql`${aiUsage.tokensIn} + ${tokensIn}`,
          tokensOut: sql`${aiUsage.tokensOut} + ${tokensOut}`,
          updatedAt: new Date(),
        },
      });

    // Save both messages only after success (separate inserts, so createdAt differs)
    await db.insert(chatMessages).values({
      id: randomUUID(),
      conversationId,
      role: "user",
      content: message,
    });
    await db.insert(chatMessages).values({
      id: randomUUID(),
      conversationId,
      role: "assistant",
      content: response,
    });

    await db
      .update(conversations)
      .set({ title: updatedTitle, updatedAt: new Date() })
      .where(
        and(
          eq(conversations.id, conversationId),
          eq(conversations.userId, session.user.id),
        ),
      );

    return NextResponse.json({
      conversationId,
      response,
      pendingActions,
    });
  } catch (error) {
    log.error("AI route error", { error });

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { conversations, chatMessages } from "@/db/conversation";
import { corsairAccounts } from "@/db/corsair";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch conversations
    const userConvs = await db
      .select({
        id: conversations.id,
        title: conversations.title,
        createdAt: conversations.createdAt,
        updatedAt: conversations.updatedAt,
      })
      .from(conversations)
      .where(eq(conversations.userId, userId));

    const convIds = userConvs.map((c) => c.id);
    let messages: Array<{
      id: string;
      conversationId: string;
      role: string;
      content: string;
      createdAt: Date;
    }> = [];

    if (convIds.length > 0) {
      messages = await db
        .select({
          id: chatMessages.id,
          conversationId: chatMessages.conversationId,
          role: chatMessages.role,
          content: chatMessages.content,
          createdAt: chatMessages.createdAt,
        })
        .from(chatMessages)
        .where(inArray(chatMessages.conversationId, convIds));
    }

    // Group messages by conversation
    const messagesByConv = new Map<string, typeof messages>();
    for (const msg of messages) {
      const list = messagesByConv.get(msg.conversationId) || [];
      list.push(msg);
      messagesByConv.set(msg.conversationId, list);
    }

    const exportConvs = userConvs.map((c) => ({
      id: c.id,
      title: c.title,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      messages: messagesByConv.get(c.id) || [],
    }));

    // Fetch connected accounts metadata (no secrets)
    const accounts = await db
      .select({
        id: corsairAccounts.id,
        integrationId: corsairAccounts.integrationId,
        createdAt: corsairAccounts.createdAt,
      })
      .from(corsairAccounts)
      .where(eq(corsairAccounts.tenantId, userId));

    const exportData = {
      exportedAt: new Date().toISOString(),
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      },
      connectedAccounts: accounts,
      conversations: exportConvs,
    };

    const jsonString = JSON.stringify(exportData, null, 2);

    return new Response(jsonString, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="nexus-data-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (err) {
    console.error("[account/export] Error exporting data:", err);
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

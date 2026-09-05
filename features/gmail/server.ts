import { getCorsairTenant } from "@/lib/corsair-client";
import { db } from "@/lib/db";
import { corsairAccounts, corsairEntities, corsairIntegrations } from "@/db/corsair";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import crypto from "crypto";

export interface ThreadMessageItem {
  id: string;
  from: string;
  to?: string;
  date?: string;
  snippet?: string;
  bodyText?: string;
  bodyHtml?: string;
}

export interface EnrichedThread {
  id: string;
  entity_id: string;
  snippet: string;
  subject: string;
  from: string;
  createdAt: string;
  created_at: string;
  updated_at: string;
  unread: boolean;
  historyId?: string;
  messagesCount?: number;
  body?: string;
  bodyHtml?: string;
  messages?: ThreadMessageItem[];
}

function decodeBase64Url(base64UrlStr: string): string {
  try {
    const base64 = base64UrlStr.replace(/-/g, "+").replace(/_/g, "/");
    return Buffer.from(base64, "base64").toString("utf-8");
  } catch {
    return "";
  }
}

export interface ParsedBody {
  text?: string;
  html?: string;
}

export function parseMessagePart(part: any): ParsedBody {
  if (!part) return {};

  let text: string | undefined;
  let html: string | undefined;

  const mimeType = (part.mimeType || "").toLowerCase();
  const data = part.body?.data;

  if (data) {
    const decoded = decodeBase64Url(data);
    if (mimeType === "text/html") {
      html = decoded;
    } else if (mimeType === "text/plain") {
      text = decoded;
    }
  }

  if (Array.isArray(part.parts)) {
    for (const subPart of part.parts) {
      const parsed = parseMessagePart(subPart);
      if (parsed.html && !html) html = parsed.html;
      if (parsed.text && !text) text = parsed.text;
    }
  }

  return { text, html };
}

/**
 * Retrieve the Gmail account ID for a given user tenant ID from corsairAccounts.
 */
export async function getGmailAccountId(userId: string): Promise<string | null> {
  try {
    const accts = await db
      .select({ id: corsairAccounts.id })
      .from(corsairAccounts)
      .innerJoin(corsairIntegrations, eq(corsairAccounts.integrationId, corsairIntegrations.id))
      .where(
        and(
          eq(corsairAccounts.tenantId, userId),
          eq(corsairIntegrations.name, "gmail")
        )
      )
      .limit(1);
    return accts[0]?.id || null;
  } catch (err) {
    console.warn("Failed to get Gmail account ID:", err);
    return null;
  }
}

/**
 * Read cached threads directly from PostgreSQL corsair_entities.
 * Returns fully enriched threads with from/subject/unread/body intact.
 */
export async function getInboxThreadsFromDb(userId: string): Promise<EnrichedThread[]> {
  try {
    const accountId = await getGmailAccountId(userId);
    if (!accountId) return [];

    const rows = await db
      .select()
      .from(corsairEntities)
      .where(
        and(
          eq(corsairEntities.accountId, accountId),
          eq(corsairEntities.entityType, "threads")
        )
      );

    const threads: EnrichedThread[] = [];
    for (const row of rows) {
      const d = (row.data || {}) as Record<string, any>;
      const ts =
        d.createdAt ||
        d.created_at ||
        (row.createdAt ? row.createdAt.toISOString() : new Date().toISOString());

      threads.push({
        id: row.entityId || d.id || "",
        entity_id: row.entityId || d.id || "",
        snippet: d.snippet || "",
        subject: d.subject || "",
        from: d.from || "",
        createdAt: typeof ts === "string" ? ts : new Date(ts).toISOString(),
        created_at: typeof ts === "string" ? ts : new Date(ts).toISOString(),
        updated_at: typeof ts === "string" ? ts : new Date(ts).toISOString(),
        unread: d.unread !== undefined ? Boolean(d.unread) : true,
        historyId: d.historyId,
        messagesCount: d.messagesCount || (Array.isArray(d.messages) ? d.messages.length : 1),
        body: d.body || d.snippet || "",
        bodyHtml: d.bodyHtml || "",
        messages: d.messages || [],
      });
    }

    // Sort by latest createdAt first safely
    threads.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
    });
    return threads;
  } catch (err) {
    console.warn("Error reading threads from DB:", err);
    return [];
  }
}

/**
 * Persist fully enriched threads into PostgreSQL corsair_entities.
 */
export async function saveEnrichedThreadsToDb(accountId: string, threads: EnrichedThread[]) {
  for (const thread of threads) {
    try {
      const existing = await db
        .select({ id: corsairEntities.id })
        .from(corsairEntities)
        .where(
          and(
            eq(corsairEntities.accountId, accountId),
            eq(corsairEntities.entityType, "threads"),
            eq(corsairEntities.entityId, thread.id)
          )
        )
        .limit(1);

      const dataToSave = {
        id: thread.id,
        entity_id: thread.id,
        snippet: thread.snippet,
        subject: thread.subject,
        from: thread.from,
        createdAt: thread.createdAt,
        created_at: thread.created_at,
        updated_at: thread.updated_at,
        unread: thread.unread,
        historyId: thread.historyId,
        messagesCount: thread.messagesCount,
        body: thread.body,
        bodyHtml: thread.bodyHtml,
        messages: thread.messages,
      };

      if (existing.length > 0) {
        await db
          .update(corsairEntities)
          .set({
            data: dataToSave,
            updatedAt: new Date(),
          })
          .where(eq(corsairEntities.id, existing[0].id));
      } else {
        await db.insert(corsairEntities).values({
          id: crypto.randomUUID(),
          accountId,
          entityId: thread.id,
          entityType: "threads",
          version: "1.0.0",
          data: dataToSave,
          createdAt: new Date(thread.createdAt || Date.now()),
          updatedAt: new Date(),
        });
      }
    } catch (err) {
      console.warn(`Failed to save thread ${thread.id} to DB:`, err);
    }
  }
}

/**
 * Read threads from the local DB for the currently authenticated user.
 */
export async function getInboxThreads(): Promise<EnrichedThread[]> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return [];
    }
    return await getInboxThreadsFromDb(session.user.id);
  } catch (err) {
    console.warn("DB thread fetch failed:", err);
    return [];
  }
}

/**
 * Fetch a single full thread by ID. Checks local DB cache first before hitting Gmail API.
 */
export async function getThreadById(threadId: string): Promise<EnrichedThread | null> {
  // Check DB cache first
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (session?.user?.id) {
      const accountId = await getGmailAccountId(session.user.id);
      if (accountId) {
        const row = await db
          .select()
          .from(corsairEntities)
          .where(
            and(
              eq(corsairEntities.accountId, accountId),
              eq(corsairEntities.entityType, "threads"),
              eq(corsairEntities.entityId, threadId)
            )
          )
          .limit(1);

        if (row.length > 0) {
          const d = (row[0].data || {}) as Record<string, any>;
          if (d.body || d.bodyHtml) {
            return {
              id: threadId,
              entity_id: threadId,
              snippet: d.snippet || "",
              subject: d.subject || "",
              from: d.from || "",
              createdAt: d.createdAt || row[0].createdAt.toISOString(),
              created_at: d.createdAt || row[0].createdAt.toISOString(),
              updated_at: d.updatedAt ? row[0].updatedAt.toISOString() : new Date().toISOString(),
              unread: d.unread !== undefined ? Boolean(d.unread) : true,
              historyId: d.historyId,
              messagesCount: d.messagesCount || 1,
              body: d.body || "",
              bodyHtml: d.bodyHtml || "",
              messages: d.messages || [],
            };
          }
        }
      }
    }
  } catch (err) {
    console.warn("DB check in getThreadById failed:", err);
  }

  // Not in DB or missing body: fetch from Gmail API
  const corsair = await getCorsairTenant();
  try {
    const full = await corsair.gmail.api.threads.get({ id: threadId, format: "full" });
    if (!full || !full.id) return null;

    const messages: any[] = full.messages || [];
    let primaryBodyHtml = "";
    let primaryBodyText = "";

    const parsedMessages: ThreadMessageItem[] = messages.map((msg: any) => {
      const getMsgHeader = (name: string): string | undefined => {
        return (msg.payload?.headers || []).find(
          (h: any) => h.name?.toLowerCase() === name.toLowerCase()
        )?.value;
      };

      const { text, html } = parseMessagePart(msg.payload);
      if (html) primaryBodyHtml = html;
      if (text) primaryBodyText = text;

      return {
        id: msg.id || "",
        from: getMsgHeader("from") || "Unknown Sender",
        to: getMsgHeader("to"),
        date: getMsgHeader("date"),
        snippet: msg.snippet || "",
        bodyText: text || msg.snippet || "",
        bodyHtml: html || "",
      };
    });

    const lastMsg = messages[messages.length - 1] || {};
    const firstMsg = messages[0] || {};
    const getHeader = (name: string): string | undefined => {
      let h = (lastMsg?.payload?.headers || []).find(
        (h: any) => h.name?.toLowerCase() === name.toLowerCase()
      );
      if (h) return h.value;
      h = (firstMsg?.payload?.headers || []).find(
        (h: any) => h.name?.toLowerCase() === name.toLowerCase()
      );
      if (h) return h.value;
      for (const msg of messages) {
        h = (msg.payload?.headers || []).find(
          (h: any) => h.name?.toLowerCase() === name.toLowerCase()
        );
        if (h) return h.value;
      }
      return undefined;
    };

    const subject = getHeader("subject") || full.snippet?.slice(0, 60) || "No Subject";
    const fromRaw = getHeader("from") || "Unknown Sender";
    const dateRaw = getHeader("date");
    const internalDate = lastMsg.internalDate || firstMsg.internalDate;
    const createdAt = internalDate
      ? new Date(Number(internalDate)).toISOString()
      : dateRaw
      ? new Date(dateRaw).toISOString()
      : new Date().toISOString();
    const isUnread = messages.some((m: any) => m.labelIds?.includes("UNREAD"));

    const enrichedResult: EnrichedThread = {
      id: full.id,
      entity_id: full.id,
      snippet: full.snippet || lastMsg.snippet || "",
      subject,
      from: fromRaw,
      createdAt,
      created_at: createdAt,
      updated_at: createdAt,
      unread: isUnread,
      historyId: full.historyId,
      messagesCount: messages.length,
      body: primaryBodyText || full.snippet || "",
      bodyHtml: primaryBodyHtml || "",
      messages: parsedMessages,
    };

    // Save to DB in background if user account is accessible
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (session?.user?.id) {
        const accountId = await getGmailAccountId(session.user.id);
        if (accountId) {
          saveEnrichedThreadsToDb(accountId, [enrichedResult]).catch(() => {});
        }
      }
    } catch {}

    return enrichedResult;
  } catch (err) {
    console.error(`Failed to get thread ${threadId}:`, err);
    return null;
  }
}

/**
 * Process items in small concurrent batches with an inter-batch pause.
 */
async function batchedMap<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  batchSize = 2,
  delayMs = 250
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(fn));
    results.push(...batchResults);
    if (i + batchSize < items.length) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  return results;
}

/**
 * Smart sync:
 * 1. Makes 1 threads.list call to the Gmail API.
 * 2. Checks local DB: if a thread is already cached with sender & subject, skips threads.get (0 quota cost!).
 * 3. Only calls threads.get for new/uncached threads, batched safely.
 * 4. Saves newly fetched threads into the DB.
 * 5. Returns all threads from the DB.
 */
export async function syncInboxThreadsFromApi(limit = 10): Promise<EnrichedThread[]> {
  let userId: string | undefined;
  let accountId: string | null = null;
  let existingDbThreads: EnrichedThread[] = [];

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    userId = session?.user?.id;
    if (userId) {
      accountId = await getGmailAccountId(userId);
      if (accountId) {
        existingDbThreads = await getInboxThreadsFromDb(userId);
      }
    }
  } catch (err) {
    console.warn("Could not load user account for DB caching:", err);
  }

  const corsair = await getCorsairTenant();

  // 1. Single threads.list call (1 API call)
  let rawThreads: { id?: string; snippet?: string; historyId?: string }[] = [];
  try {
    const res = await corsair.gmail.api.threads.list({ maxResults: limit });
    rawThreads = res?.threads ?? [];
  } catch (err) {
    console.warn("Gmail threads.list failed, falling back to cached DB threads:", err);
    return existingDbThreads;
  }

  if (!rawThreads.length) {
    return existingDbThreads;
  }

  // 2. Identify which threads are NOT yet cached with valid from and subject
  const cachedMap = new Map<string, EnrichedThread>(
    existingDbThreads.map((t) => [t.id, t])
  );

  const threadsToFetch: { id: string; snippet?: string; historyId?: string }[] = [];

  for (const t of rawThreads) {
    if (!t.id) continue;
    const cached = cachedMap.get(t.id);
    const isFullyCached =
      cached &&
      cached.from &&
      cached.from !== "Unknown Sender" &&
      cached.subject &&
      cached.subject !== "No Subject";
    if (!isFullyCached) {
      threadsToFetch.push({ id: t.id, snippet: t.snippet, historyId: t.historyId });
    }
  }

  // 3. Fetch ONLY uncached threads, batched safely
  if (threadsToFetch.length > 0) {
    const newlyEnriched = await batchedMap(
      threadsToFetch,
      async (t) => {
        try {
          const full = await corsair.gmail.api.threads.get({ id: t.id, format: "full" });
          const messages: any[] = full?.messages || [];
          const lastMsg = messages[messages.length - 1] || {};
          const firstMsg = messages[0] || {};

          const getHeader = (name: string): string | undefined => {
            let h = (lastMsg?.payload?.headers || []).find(
              (h: any) => h.name?.toLowerCase() === name.toLowerCase()
            );
            if (h) return h.value;
            h = (firstMsg?.payload?.headers || []).find(
              (h: any) => h.name?.toLowerCase() === name.toLowerCase()
            );
            if (h) return h.value;
            for (const msg of messages) {
              h = (msg.payload?.headers || []).find(
                (h: any) => h.name?.toLowerCase() === name.toLowerCase()
              );
              if (h) return h.value;
            }
            return undefined;
          };

          const subject = getHeader("subject") || t.snippet?.slice(0, 60) || "No Subject";
          const fromRaw = getHeader("from") || "Unknown Sender";
          const dateRaw = getHeader("date");
          const internalDate = lastMsg.internalDate || firstMsg.internalDate;
          const createdAt = internalDate
            ? new Date(Number(internalDate)).toISOString()
            : dateRaw
            ? new Date(dateRaw).toISOString()
            : new Date().toISOString();
          const isUnread = messages.some((m: any) => m.labelIds?.includes("UNREAD"));

          // Extract full email bodies
          let bodyHtml = "";
          let bodyText = "";
          for (let i = messages.length - 1; i >= 0; i--) {
            const { html, text } = parseMessagePart(messages[i]?.payload);
            if (html && !bodyHtml) bodyHtml = html;
            if (text && !bodyText) bodyText = text;
            if (bodyHtml && bodyText) break;
          }

          const parsedMessages: ThreadMessageItem[] = messages.map((msg: any) => {
            const getMsgH = (name: string): string | undefined => {
              return (msg.payload?.headers || []).find(
                (h: any) => h.name?.toLowerCase() === name.toLowerCase()
              )?.value;
            };
            const { text, html } = parseMessagePart(msg.payload);
            return {
              id: msg.id || "",
              from: getMsgH("from") || "Unknown Sender",
              to: getMsgH("to"),
              date: getMsgH("date"),
              snippet: msg.snippet || "",
              bodyText: text || msg.snippet || "",
              bodyHtml: html || "",
            };
          });

          return {
            id: t.id,
            entity_id: t.id,
            snippet: t.snippet || (lastMsg.snippet as string | undefined) || "",
            subject,
            from: fromRaw,
            createdAt,
            created_at: createdAt,
            updated_at: createdAt,
            unread: isUnread,
            historyId: t.historyId,
            messagesCount: messages.length,
            body: bodyText || t.snippet || "",
            bodyHtml: bodyHtml || "",
            messages: parsedMessages,
          } as EnrichedThread;
        } catch (err) {
          console.warn(`Failed to enrich thread ${t.id}:`, err);
          return null;
        }
      },
      2,   // batch size 2
      250  // 250ms pause between batches
    );

    const validNew = newlyEnriched.filter((t): t is EnrichedThread => t !== null);

    // Save newly enriched threads to DB
    if (accountId && validNew.length > 0) {
      await saveEnrichedThreadsToDb(accountId, validNew);
    }
  }

  // 4. Return the updated list from the DB
  if (userId) {
    const updated = await getInboxThreadsFromDb(userId);
    if (updated.length > 0) {
      return updated;
    }
  }

  return existingDbThreads;
}
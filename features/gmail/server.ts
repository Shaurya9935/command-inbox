import { getCorsairTenant } from "@/lib/corsair-client";
import { db } from "@/lib/db";
import { corsairAccounts, corsairEntities, corsairIntegrations } from "@/db/corsair";
import { and, desc, eq } from "drizzle-orm";
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

const GMAIL_SYNC_STATE_ENTITY_TYPE = "gmail_sync_state";
const GMAIL_SYNC_STATE_ENTITY_ID = "inbox";
const GMAIL_SYNC_INTERVAL_MS = 15 * 60 * 1000;

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

type GmailMessage = {
  internalDate?: string;
  labelIds?: string[];
  payload?: { headers?: Array<{ name?: string; value?: string }> };
};

function getMessageHeader(message: GmailMessage | undefined, name: string): string | undefined {
  return message?.payload?.headers?.find(
    (header) => header.name?.toLowerCase() === name.toLowerCase()
  )?.value;
}

/** Prefer the latest message received by the user over a later sent reply. */
function getLatestIncomingMessage(messages: GmailMessage[]): GmailMessage | undefined {
  return [...messages].reverse().find((message) => !message.labelIds?.includes("SENT")) ?? messages.at(-1);
}

function getMessageTime(message: GmailMessage | undefined, fallback?: string): string {
  if (message?.internalDate) {
    const date = new Date(Number(message.internalDate));
    if (!Number.isNaN(date.getTime())) return date.toISOString();
  }

  if (fallback) {
    const date = new Date(fallback);
    if (!Number.isNaN(date.getTime())) return date.toISOString();
  }

  return new Date().toISOString();
}

function hasUsableThreadMetadata(thread: EnrichedThread | undefined): boolean {
  return Boolean(
    thread &&
      thread.from &&
      thread.from !== "Unknown Sender" &&
      thread.from !== "Gmail User" &&
      thread.subject &&
      thread.subject !== "No Subject"
  );
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
      )
      .orderBy(desc(corsairEntities.updatedAt));

    const threads: EnrichedThread[] = [];
    const seenThreadIds = new Set<string>();
    for (const row of rows) {
      const d = (row.data || {}) as Record<string, any>;
      const threadId = row.entityId || d.id || "";
      // Earlier development builds could create duplicate rows during
      // overlapping syncs. Prefer the newest version and hide older copies.
      if (!threadId || seenThreadIds.has(threadId)) continue;
      seenThreadIds.add(threadId);
      const ts =
        d.createdAt ||
        d.created_at ||
        (row.createdAt ? row.createdAt.toISOString() : new Date().toISOString());

      threads.push({
        id: threadId,
        entity_id: threadId,
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
        .orderBy(desc(corsairEntities.updatedAt))
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
      // A successful Gmail response is not a successful sync unless it was
      // persisted. Propagate this so callers do not silently keep serving
      // stale cache data.
      throw err;
    }
  }
}

async function getLastGmailSyncAt(accountId: string): Promise<Date | null> {
  const row = await db
    .select({ data: corsairEntities.data })
    .from(corsairEntities)
    .where(
      and(
        eq(corsairEntities.accountId, accountId),
        eq(corsairEntities.entityType, GMAIL_SYNC_STATE_ENTITY_TYPE),
        eq(corsairEntities.entityId, GMAIL_SYNC_STATE_ENTITY_ID)
      )
    )
    .limit(1);

  const value = (row[0]?.data as { lastSyncedAt?: unknown } | undefined)?.lastSyncedAt;
  if (typeof value !== "string") return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function markGmailSyncComplete(accountId: string): Promise<void> {
  const existing = await db
    .select({ id: corsairEntities.id })
    .from(corsairEntities)
    .where(
      and(
        eq(corsairEntities.accountId, accountId),
        eq(corsairEntities.entityType, GMAIL_SYNC_STATE_ENTITY_TYPE),
        eq(corsairEntities.entityId, GMAIL_SYNC_STATE_ENTITY_ID)
      )
    )
    .limit(1);

  const data = { lastSyncedAt: new Date().toISOString() };
  if (existing[0]) {
    await db
      .update(corsairEntities)
      .set({ data, updatedAt: new Date() })
      .where(eq(corsairEntities.id, existing[0].id));
    return;
  }

  await db.insert(corsairEntities).values({
    id: crypto.randomUUID(),
    accountId,
    entityId: GMAIL_SYNC_STATE_ENTITY_ID,
    entityType: GMAIL_SYNC_STATE_ENTITY_TYPE,
    version: "1.0.0",
    data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
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
          .orderBy(desc(corsairEntities.updatedAt))
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
    const latestIncomingMessage = getLatestIncomingMessage(messages);
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
    const fromRaw =
      getMessageHeader(latestIncomingMessage, "from") ||
      getHeader("from") ||
      "Unknown Sender";
    const dateRaw = getHeader("date");
    const createdAt = getMessageTime(latestIncomingMessage, dateRaw);
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

    // Persist before responding. Background writes made this endpoint report
    // success even when the cache write failed, causing repeated Gmail reads.
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (session?.user?.id) {
        const accountId = await getGmailAccountId(session.user.id);
        if (accountId) {
          await saveEnrichedThreadsToDb(accountId, [enrichedResult]);
        }
      }
    } catch (err) {
      console.warn(`Failed to cache thread ${threadId}:`, err);
    }

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
 * 2. Checks local DB: skips threads.get only when the cached Gmail historyId
 *    matches the list result. A changed historyId means labels, unread state,
 *    messages, or metadata changed and the cache must be refreshed.
 * 3. Only calls threads.get for new/changed threads, batched safely.
 * 4. Saves newly fetched threads into the DB.
 * 5. Returns all threads from the DB.
 */
export async function syncInboxThreadsFromApi(
  limit = 10,
  { force = false }: { force?: boolean } = {}
): Promise<EnrichedThread[]> {
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

  if (!userId) {
    throw new Error("Unauthorized");
  }

  if (!accountId) {
    throw new Error("Gmail is not connected for this user");
  }

  // Keep normal page loads cache-only until the scheduled refresh is due.
  // `force` is reserved for an explicit user refresh.
  const cacheNeedsRepair = existingDbThreads.some(
    (thread) => !hasUsableThreadMetadata(thread)
  );

  if (!force && existingDbThreads.length > 0 && !cacheNeedsRepair) {
    const lastSyncedAt = await getLastGmailSyncAt(accountId);
    if (lastSyncedAt && Date.now() - lastSyncedAt.getTime() < GMAIL_SYNC_INTERVAL_MS) {
      return existingDbThreads;
    }
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
    await markGmailSyncComplete(accountId);
    return existingDbThreads;
  }

  // 2. Fetch newly discovered threads and cached threads whose Gmail history
  // changed. The previous implementation only tested for sender/subject, so a
  // cache entry became permanently stale after its first successful sync.
  const cachedMap = new Map<string, EnrichedThread>(
    existingDbThreads.map((t) => [t.id, t])
  );

  const threadsToFetch: { id: string; snippet?: string; historyId?: string }[] = [];
  const cachedThreadsToRestore: EnrichedThread[] = [];

  for (const t of rawThreads) {
    if (!t.id) continue;
    const cached = cachedMap.get(t.id);
    const hasUsableCache = hasUsableThreadMetadata(cached);
    const hasChangedOnGmail = Boolean(
      t.historyId && cached?.historyId !== t.historyId
    );

    // A manual refresh intentionally rehydrates all displayed threads. This
    // repairs cache entries created by earlier builds that lacked sender or
    // Gmail internalDate metadata, while normal scheduled syncs stay sparse.
    if (force || !hasUsableCache || hasChangedOnGmail) {
      threadsToFetch.push({ id: t.id, snippet: t.snippet, historyId: t.historyId });
    } else if (cached) {
      // Corsair's threads.list persists a minimal `{ id, snippet, historyId }`
      // entity as a side effect. Restore our richer cache entry so an unchanged
      // thread does not lose its sender, internal date, or body after a sync.
      cachedThreadsToRestore.push({
        ...cached,
        snippet: t.snippet || cached.snippet,
        historyId: t.historyId || cached.historyId,
      });
    }
  }

  if (cachedThreadsToRestore.length > 0) {
    await saveEnrichedThreadsToDb(accountId, cachedThreadsToRestore);
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
          const latestIncomingMessage = getLatestIncomingMessage(messages);

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
          const fromRaw =
            getMessageHeader(latestIncomingMessage, "from") ||
            getHeader("from") ||
            "Unknown Sender";
          const dateRaw = getHeader("date");
          const createdAt = getMessageTime(latestIncomingMessage, dateRaw);
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

  // Only mark the sync after all changed threads were durably written.
  await markGmailSyncComplete(accountId);

  // 4. Return the updated list from the DB
  if (userId) {
    const updated = await getInboxThreadsFromDb(userId);
    if (updated.length > 0) {
      return updated;
    }
  }

  return existingDbThreads;
}

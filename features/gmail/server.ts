import { getCorsairTenant } from "@/lib/corsair-client";

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
 * Read threads from the local Corsair DB.
 * Returns a basic shape — from / subject won't be populated here
 * because the DB schema only stores id, snippet, historyId, createdAt.
 * Use syncInboxThreadsFromApi() to get fully enriched data.
 */
export async function getInboxThreads(): Promise<EnrichedThread[]> {
  const corsair = await getCorsairTenant();

  try {
    const entities = await corsair.gmail.db.threads.list({ limit: 50 });
    if (Array.isArray(entities) && entities.length > 0) {
      return entities.map((e) => {
        const d = e.data;
        const ts =
          d?.createdAt instanceof Date
            ? d.createdAt.toISOString()
            : typeof d?.createdAt === "string"
            ? d.createdAt
            : new Date().toISOString();
        return {
          id: e.entity_id || d?.id || "",
          entity_id: e.entity_id || "",
          snippet: d?.snippet || "",
          subject: "",
          from: "",
          createdAt: ts,
          created_at: ts,
          updated_at: ts,
          unread: true,
          historyId: d?.historyId,
        };
      });
    }
  } catch (err) {
    console.warn("DB thread fetch failed:", err);
  }

  return [];
}

/**
 * Fetch a single full thread by ID from Gmail API, including all messages,
 * headers, plain text body, and HTML body with links intact.
 */
export async function getThreadById(threadId: string): Promise<EnrichedThread | null> {
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
      const h =
        (lastMsg?.payload?.headers || []).find(
          (h: any) => h.name?.toLowerCase() === name.toLowerCase()
        ) ||
        (firstMsg?.payload?.headers || []).find(
          (h: any) => h.name?.toLowerCase() === name.toLowerCase()
        );
      return h?.value;
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

    return {
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
  } catch (err) {
    console.error(`Failed to get thread ${threadId}:`, err);
    return null;
  }
}

/**
 * Pull fresh threads from the Gmail API, enrich with headers (from/subject/date/unread),
 * parse HTML and plain-text message bodies, upsert basic metadata to the Corsair DB cache,
 * and return the fully enriched list.
 */
export async function syncInboxThreadsFromApi(): Promise<EnrichedThread[]> {
  const corsair = await getCorsairTenant();

  const res = await corsair.gmail.api.threads.list({ maxResults: 25 });
  const rawThreads: { id?: string; snippet?: string; historyId?: string }[] =
    res?.threads ?? [];

  if (!rawThreads.length) {
    return [];
  }

  const enriched = await Promise.all(
    rawThreads.map(async (t) => {
      try {
        if (!t.id) return null;
        const full = await corsair.gmail.api.threads.get({ id: t.id, format: "full" });
        const messages: any[] = full?.messages || [];
        const lastMsg = messages[messages.length - 1] || {};
        const firstMsg = messages[0] || {};

        const getHeader = (name: string): string | undefined => {
          const h =
            (lastMsg?.payload?.headers || []).find(
              (h: any) => h.name?.toLowerCase() === name.toLowerCase()
            ) ||
            (firstMsg?.payload?.headers || []).find(
              (h: any) => h.name?.toLowerCase() === name.toLowerCase()
            );
          return h?.value;
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

        // Upsert basic metadata to DB (schema only supports id/snippet/historyId/createdAt)
        try {
          await corsair.gmail.db.threads.upsertByEntityId(t.id, {
            id: t.id,
            snippet: t.snippet || undefined,
            historyId: t.historyId || undefined,
            createdAt: new Date(createdAt),
          });
        } catch {
          // Non-fatal — DB cache update failure doesn't affect what we return
        }

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
        };
      } catch (err) {
        console.warn(`Failed to enrich thread ${t.id}:`, err);
        return null;
      }
    })
  );

  return enriched.filter((t): t is NonNullable<typeof t> => t !== null) as EnrichedThread[];
}
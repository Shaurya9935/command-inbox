import { getCorsairTenant } from "@/lib/corsair-client";

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
          // DB schema doesn't store from/subject — these will be empty
          // until a sync runs. The hook always syncs on mount so users see
          // cached data first, then enriched data arrives within seconds.
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
 * Pull fresh threads from the Gmail API, enrich with headers (from/subject/date/unread),
 * upsert basic metadata to the Corsair DB cache, and return the fully enriched list.
 *
 * This is the source of truth for from, subject, unread, and accurate dates.
 * Call this at most once every 15 minutes (enforced by the hook).
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
        const full = await corsair.gmail.api.threads.get({ id: t.id });
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
        };
      } catch (err) {
        console.warn(`Failed to enrich thread ${t.id}:`, err);
        return null;
      }
    })
  );

  return enriched.filter((t): t is NonNullable<typeof t> => t !== null) as EnrichedThread[];
}
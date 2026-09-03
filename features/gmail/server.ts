import { getCorsairTenant } from "@/lib/corsair-client";

/** Read enriched threads from the local Corsair DB — fast, no rate limits. */
export async function getInboxThreads() {
  const corsair = await getCorsairTenant();

  try {
    // corsair.gmail.db.threads.list accepts { limit?, offset? }
    const threads = await corsair.gmail.db.threads.list({ limit: 50 });
    if (Array.isArray(threads) && threads.length > 0) {
      return threads;
    }
  } catch (err) {
    console.warn("DB thread fetch failed:", err);
  }

  return [];
}

/**
 * Pull fresh data from the Gmail API, enrich each thread, then upsert back
 * into the Corsair DB so subsequent reads are served from the cache.
 *
 * Call this at most once every 15 minutes (enforced by the hook).
 */
export async function syncInboxThreadsFromApi(): Promise<{ synced: number }> {
  const corsair = await getCorsairTenant();

  const res = await corsair.gmail.api.threads.list({ maxResults: 25 });
  const rawThreads: { id?: string; snippet?: string; historyId?: string }[] =
    res?.threads ?? [];

  if (!rawThreads.length) {
    return { synced: 0 };
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

        const subject = getHeader("subject") || t.snippet?.slice(0, 40) || "No Subject";
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
          id: t.id,
          snippet: t.snippet || lastMsg.snippet || "",
          subject,
          from: fromRaw,
          createdAt: new Date(createdAt),
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

  const valid = enriched.filter((t): t is NonNullable<typeof t> => t !== null);

  // Upsert enriched threads into the Corsair DB cache
  await Promise.allSettled(
    valid.map(async (thread) => {
      try {
        // upsertByEntityId(externalId, dataMatchingSchema)
        await corsair.gmail.db.threads.upsertByEntityId(thread.id, {
          id: thread.id,
          snippet: thread.snippet || undefined,
          historyId: thread.historyId || undefined,
          createdAt: thread.createdAt || undefined,
        });
      } catch (e) {
        // Non-fatal — next full read will still return whatever's in the DB
        console.warn(`Failed to upsert thread ${thread.id}:`, e);
      }
    })
  );

  return { synced: valid.length };
}
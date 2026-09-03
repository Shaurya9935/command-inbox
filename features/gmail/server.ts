import { getCorsairTenant } from "@/lib/corsair-client";

export async function getInboxThreads() {
  const corsair = await getCorsairTenant();

  // 1. Fetch live threads from Gmail API via corsair.gmail.api.threads.list
  try {
    const res = await corsair.gmail.api.threads.list({
      maxResults: 25,
    });
    if (res?.threads && res.threads.length > 0) {
      // Enrich threads in parallel with sender, subject, date, and unread status
      const enrichedThreads = await Promise.all(
        res.threads.map(async (t) => {
          try {
            if (!t.id) return t;
            const full = await corsair.gmail.api.threads.get({ id: t.id });
            const messages = full?.messages || [];
            const lastMsg = messages[messages.length - 1] || {};
            const firstMsg = messages[0] || {};

            const getHeader = (name: string) => {
              const h =
                (lastMsg?.payload?.headers || []).find(
                  (h: any) => h.name?.toLowerCase() === name.toLowerCase()
                ) ||
                (firstMsg?.payload?.headers || []).find(
                  (h: any) => h.name?.toLowerCase() === name.toLowerCase()
                );
              return h?.value;
            };

            const subject =
              getHeader("subject") || t.snippet?.slice(0, 40) || "No Subject";
            const fromRaw = getHeader("from") || "Unknown Sender";
            const dateRaw = getHeader("date");
            const internalDate = lastMsg.internalDate || firstMsg.internalDate;
            const createdAt = internalDate
              ? new Date(Number(internalDate)).toISOString()
              : dateRaw
              ? new Date(dateRaw).toISOString()
              : new Date().toISOString();
            const isUnread = messages.some((m: any) =>
              m.labelIds?.includes("UNREAD")
            );

            return {
              id: t.id,
              entity_id: t.id,
              snippet: t.snippet || lastMsg.snippet || "",
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
            return t;
          }
        })
      );
      return enrichedThreads;
    }
  } catch (error) {
    console.warn("Live Gmail API fetch failed, falling back to local DB:", error);
  }

  // 2. Fallback to local database cache
  const dbThreads = await corsair.gmail.db.threads.list({});
  return dbThreads;
}
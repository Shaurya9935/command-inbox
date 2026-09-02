import { getCorsairTenant } from "@/lib/corsair-client";

export async function getInboxThreads() {
  const corsair = await getCorsairTenant();

  // 1. Fetch live threads from Gmail API via corsair.gmail.api.threads.list
  try {
    const res = await corsair.gmail.api.threads.list({});
    if (res?.threads && res.threads.length > 0) {
      return res.threads;
    }
  } catch (error) {
    console.warn("Live Gmail API fetch failed, falling back to local DB:", error);
  }

  // 2. Fallback to local database cache
  const dbThreads = await corsair.gmail.db.threads.list({});
  return dbThreads;
}
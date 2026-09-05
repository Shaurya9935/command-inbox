"use client";

import { useEffect, useState, useCallback, useRef } from "react";

export interface GmailThread {
  id?: string;
  entity_id?: string;
  created_at?: string | Date;
  updated_at?: string | Date;
  createdAt?: string | Date;
  data?: {
    id?: string;
    snippet?: string;
    historyId?: string;
    subject?: string;
    from?: string;
    unread?: boolean;
    createdAt?: string | Date;
    tag?: string;
    body?: string;
    bodyHtml?: string;
  };
  snippet?: string;
  subject?: string;
  from?: string;
  unread?: boolean;
  tag?: string;
  body?: string;
  bodyHtml?: string;
}

function extractThreads(data: unknown): GmailThread[] {
  if (Array.isArray(data)) return data;
  if (
    data &&
    typeof data === "object" &&
    "threads" in data &&
    Array.isArray((data as { threads: unknown }).threads)
  ) {
    return (data as { threads: GmailThread[] }).threads;
  }
  return [];
}

/** How long to wait between automatic background syncs (ms) */
const AUTO_SYNC_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

export function useGmailThreads() {
  const [threads, setThreads] = useState<GmailThread[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const mountedRef = useRef(true);

  // ── Read from DB (fast, no API call). Returns the number of threads loaded.
  const fetchFromDb = useCallback(async (silent = false): Promise<number> => {
    if (!silent) setIsLoading(true);
    setError(null);
    let count = 0;
    try {
      const res = await fetch("/api/gmail/threads");
      if (!res.ok) {
        const errorData = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(errorData?.error || `Failed to fetch threads (${res.status})`);
      }
      const data: unknown = await res.json();
      if (
        data &&
        typeof data === "object" &&
        "error" in data &&
        (data as { error: string }).error
      ) {
        throw new Error((data as { error: string }).error);
      }
      const extracted = extractThreads(data);
      count = extracted.length;
      if (mountedRef.current) {
        setThreads(extracted);
      }
    } catch (err: unknown) {
      if (mountedRef.current) {
        const message = err instanceof Error ? err.message : "Failed to load Gmail threads";
        console.error("useGmailThreads fetchFromDb error:", err);
        setError(message);
        setThreads([]);
      }
    } finally {
      if (mountedRef.current && !silent) setIsLoading(false);
    }
    return count;
  }, []);

  // ── Sync from Gmail API then refresh DB read ──────────────────────────────
  const syncFromApi = useCallback(async () => {
    if (!mountedRef.current) return;
    setIsSyncing(true);
    setError(null);
    try {
      const res = await fetch("/api/gmail/threads?sync=1");
      if (!res.ok) {
        const errorData = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(errorData?.error || `Sync failed (${res.status})`);
      }
      const data: unknown = await res.json();
      if (mountedRef.current) {
        setThreads(extractThreads(data));
        setLastSyncedAt(new Date());
      }
    } catch (err: unknown) {
      if (mountedRef.current) {
        const message = err instanceof Error ? err.message : "Sync failed";
        console.error("useGmailThreads syncFromApi error:", err);
        // Only show error banner if we don't already have threads displaying from DB
        setThreads((prev) => {
          if (prev.length === 0) {
            setError(message);
          }
          return prev;
        });
      }
    } finally {
      if (mountedRef.current) setIsSyncing(false);
    }
  }, []);

  // ── Mount: load from DB immediately, then trigger API sync to fetch & store new mails
  useEffect(() => {
    mountedRef.current = true;

    async function init() {
      // 1. Immediately show whatever is already in the DB (fast, 0 API quota)
      await fetchFromDb();

      // 2. When user opens the site or refreshes, sync new emails from API into DB
      if (mountedRef.current) {
        try {
          await syncFromApi();
        } catch {
          // DB data already shown
        }
      }
    }

    init();

    // Auto-sync every 15 minutes while the page is open
    const timer = setInterval(() => {
      syncFromApi();
    }, AUTO_SYNC_INTERVAL_MS);

    return () => {
      mountedRef.current = false;
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    threads,
    isLoading,
    /** True only during an active API sync (not DB reads) */
    isSyncing,
    error,
    lastSyncedAt,
    /** Re-read from the local DB (fast, no API call) */
    refetch: () => fetchFromDb(),
    /** Manually trigger a full Gmail API sync + DB refresh */
    sync: syncFromApi,
  };
}
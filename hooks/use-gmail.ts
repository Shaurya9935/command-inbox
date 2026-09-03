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
  };
  snippet?: string;
  subject?: string;
  from?: string;
  unread?: boolean;
  tag?: string;
  body?: string;
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

  // ── Read from DB (fast, no API call) ─────────────────────────────────────
  const fetchFromDb = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    setError(null);
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
      if (mountedRef.current) {
        setThreads(extractThreads(data));
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
        setError(message);
      }
    } finally {
      if (mountedRef.current) setIsSyncing(false);
    }
  }, []);

  // ── Mount: sync from API immediately (returns enriched from/subject/unread),
  // then set a 15-min recurring auto-sync. Fall back to DB on sync failure.
  useEffect(() => {
    mountedRef.current = true;

    async function init() {
      // Always sync on mount so from/subject/unread are populated immediately
      try {
        await syncFromApi();
      } catch {
        // Sync failed (e.g. network, rate limit) — load whatever is in the DB
        await fetchFromDb();
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
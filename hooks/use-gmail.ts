"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { log } from "@/lib/logger";

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
    created_at?: string | Date;
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
  const router = useRouter();
  const [threads, setThreads] = useState<GmailThread[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
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
        const errorData = (await res.json().catch(() => null)) as {
          error?: string;
          notConnected?: boolean;
        } | null;
        if (
          res.status === 404 &&
          (errorData?.notConnected || errorData?.error?.includes("not connected"))
        ) {
          if (mountedRef.current) {
            setIsConnected(false);
            setThreads([]);
          }
          return 0;
        }
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
        setIsConnected(true);
        setThreads(extracted);
      }
    } catch (err: unknown) {
      if (mountedRef.current) {
        const message = err instanceof Error ? err.message : "Failed to load Gmail threads";
        log.error("useGmailThreads fetchFromDb error", { error: err });
        setError(message);
        setThreads([]);
      }
    } finally {
      if (mountedRef.current && !silent) setIsLoading(false);
    }
    return count;
  }, []);

  // ── Sync from Gmail API then refresh DB read ──────────────────────────────
  const syncFromApi = useCallback(async (force = false) => {
    if (!mountedRef.current) return;
    setIsSyncing(true);
    setError(null);
    try {
      const res = await fetch(`/api/gmail/threads?sync=1${force ? "&force=1" : ""}`);
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login?expired=1");
          return;
        }
        const errorData = (await res.json().catch(() => null)) as {
          error?: string;
          notConnected?: boolean;
        } | null;
        if (
          res.status === 404 &&
          (errorData?.notConnected || errorData?.error?.includes("not connected"))
        ) {
          if (mountedRef.current) {
            setIsConnected(false);
            setThreads([]);
            setIsSyncing(false);
          }
          return;
        }
        throw new Error(errorData?.error || `Sync failed (${res.status})`);
      }
      const data: unknown = await res.json();
      if (mountedRef.current) {
        setIsConnected(true);
        setThreads(extractThreads(data));
        setLastSyncedAt(new Date());
      }
    } catch (err: unknown) {
      if (mountedRef.current) {
        const message = err instanceof Error ? err.message : "Sync failed";
        log.error("useGmailThreads syncFromApi error", { error: err });
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
  }, [router]);

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
    isConnected: isConnected !== false,
    isNotConnected: isConnected === false,
    error,
    lastSyncedAt,
    /** Re-read from the local DB (fast, no API call) */
    refetch: () => fetchFromDb(),
    /** Bypass the refresh interval after the user explicitly requests a refresh. */
    sync: () => syncFromApi(true),
  };
}

export interface UseStarredThreadsResult {
  threads: GmailThread[];
  isLoading: boolean;
  isRefreshing: boolean;
  isConnected: boolean;
  isNotConnected: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  unstar: (threadId: string | number) => Promise<boolean>;
  isStale: boolean;
  stale: boolean;
}

export function useStarredThreads(): UseStarredThreadsResult {
  const router = useRouter();
  const [threads, setThreads] = useState<GmailThread[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [isStale, setIsStale] = useState<boolean>(false);
  const mountedRef = useRef(true);
  const initialLoadDone = useRef(false);

  const fetchStarred = useCallback(
    async (isBackground = false, pageToken?: string, cachedOnly = false): Promise<void> => {
      if (!isBackground && !pageToken && !cachedOnly) {
        setIsLoading(true);
      } else if (isBackground) {
        setIsRefreshing(true);
      }
      setError(null);

      try {
        const queryParams = new URLSearchParams({ limit: "25" });
        if (pageToken) queryParams.set("pageToken", pageToken);
        if (cachedOnly) queryParams.set("cached", "1");

        const res = await fetch(`/api/gmail/starred?${queryParams.toString()}`);

        if (!res.ok) {
          if (res.status === 401) {
            router.push("/login?expired=1");
            return;
          }
          const errorData = (await res.json().catch(() => null)) as {
            error?: string;
            notConnected?: boolean;
          } | null;
          if (res.status === 404 && (errorData?.notConnected || errorData?.error?.includes("not connected"))) {
            if (mountedRef.current) {
              setIsConnected(false);
              setThreads([]);
              setIsLoading(false);
              setIsRefreshing(false);
            }
            return;
          }
          throw new Error(errorData?.error || `Failed to fetch starred threads (${res.status})`);
        }

        if (mountedRef.current) {
          setIsConnected(true);
        }

        const data = (await res.json()) as {
          threads?: GmailThread[];
          nextPageToken?: string;
          stale?: boolean;
        };

        const extracted = extractThreads(data);

        if (mountedRef.current) {
          if (pageToken) {
            setThreads((prev) => {
              const seen = new Set(prev.map((t) => t.entity_id || t.id || t.data?.id));
              const deduped = extracted.filter(
                (t) => !seen.has(t.entity_id || t.id || t.data?.id)
              );
              return [...prev, ...deduped];
            });
          } else {
            setThreads(extracted);
          }
          setNextPageToken(data.nextPageToken || null);
          setIsStale(Boolean(data.stale));

          // If cached data was loaded and has items, turn off skeleton loading right away
          if (cachedOnly && extracted.length > 0) {
            setIsLoading(false);
          }
        }
      } catch (err: unknown) {
        if (mountedRef.current) {
          const message = err instanceof Error ? err.message : "Failed to load starred threads";
          log.error("useStarredThreads fetch error", { error: err });
          setError(message);
        }
      } finally {
        if (mountedRef.current) {
          if (!cachedOnly) {
            setIsLoading(false);
            setIsRefreshing(false);
          }
        }
      }
    },
    [router]
  );

  useEffect(() => {
    mountedRef.current = true;

    async function init() {
      // 1. Immediately load cached DB data for instant render
      await fetchStarred(false, undefined, true);

      // 2. Quietly refresh in background from Gmail API
      if (mountedRef.current) {
        try {
          await fetchStarred(true);
        } catch {
          // DB data already shown
        }
      }
    }

    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      init();
    }

    return () => {
      mountedRef.current = false;
    };
  }, [fetchStarred]);

  const refresh = useCallback(async () => {
    await fetchStarred(true);
  }, [fetchStarred]);

  const loadMore = useCallback(async () => {
    if (!nextPageToken || isLoading || isRefreshing) return;
    await fetchStarred(false, nextPageToken);
  }, [fetchStarred, nextPageToken, isLoading, isRefreshing]);

  const unstar = useCallback(
    async (threadId: string | number): Promise<boolean> => {
      const idStr = String(threadId);
      let originalThreads: GmailThread[] = [];

      // Optimistic removal: remove immediately
      setThreads((prev) => {
        originalThreads = prev;
        return prev.filter((t) => {
          const tid = t.entity_id || t.id || t.data?.id;
          return tid !== undefined && String(tid) !== idStr;
        });
      });

      try {
        const res = await fetch(`/api/gmail/threads/${encodeURIComponent(idStr)}/star`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(data.error || `Failed to unstar (${res.status})`);
        }

        return true;
      } catch (err: unknown) {
        log.error("Failed to unstar thread, rolling back", { error: err });
        // Restore threads on failure
        if (mountedRef.current) {
          setThreads(originalThreads);
          const message = err instanceof Error ? err.message : "Failed to unstar email";
          setError(message);
        }
        return false;
      }
    },
    []
  );

  return {
    threads,
    isLoading,
    isRefreshing,
    isConnected: isConnected !== false,
    isNotConnected: isConnected === false,
    error,
    hasMore: Boolean(nextPageToken),
    loadMore,
    refresh,
    unstar,
    isStale,
    stale: isStale,
  };
}

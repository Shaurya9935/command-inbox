"use client";

import { useEffect, useState, useCallback } from "react";

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
  if (Array.isArray(data)) {
    return data;
  }
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

export function useGmailThreads() {
  const [threads, setThreads] = useState<GmailThread[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchThreads = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/gmail/threads");
      if (!res.ok) {
        const errorData = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(errorData?.error || `Failed to fetch threads (${res.status})`);
      }
      const data: unknown = await res.json();
      if (data && typeof data === "object" && "error" in data && (data as { error: string }).error) {
        throw new Error((data as { error: string }).error);
      }
      setThreads(extractThreads(data));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load Gmail threads";
      console.error("useGmailThreads error:", err);
      setError(message);
      setThreads([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const res = await fetch("/api/gmail/threads");
        if (!res.ok) {
          const errorData = (await res.json().catch(() => null)) as { error?: string } | null;
          throw new Error(errorData?.error || `Failed to fetch threads (${res.status})`);
        }
        const data: unknown = await res.json();
        if (!ignore) {
          if (data && typeof data === "object" && "error" in data && (data as { error: string }).error) {
            throw new Error((data as { error: string }).error);
          }
          setThreads(extractThreads(data));
        }
      } catch (err: unknown) {
        if (!ignore) {
          const message = err instanceof Error ? err.message : "Failed to load Gmail threads";
          console.error("useGmailThreads error:", err);
          setError(message);
          setThreads([]);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, []);

  return {
    threads,
    isLoading,
    error,
    refetch: fetchThreads,
  };
}
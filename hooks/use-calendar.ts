"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { CalEvent, EventType } from "@/components/calendar/types";
import { CalendarEvent } from "@/components/dashboard/types";

export interface GoogleCalendarApiEvent {
  id: string;
  entity_id?: string;
  summary?: string;
  description?: string;
  location?: string;
  start?: {
    date?: string;
    dateTime?: string;
    timeZone?: string;
  };
  end?: {
    date?: string;
    dateTime?: string;
    timeZone?: string;
  };
  status?: "tentative" | "confirmed" | "cancelled";
  htmlLink?: string;
  hangoutLink?: string;
  creator?: { email?: string; displayName?: string };
  organizer?: { email?: string; displayName?: string };
  attendees?: Array<{ email?: string; displayName?: string; responseStatus?: string }>;
  created?: string;
  updated?: string;
  createdAt?: string;
}

function extractEvents(data: unknown): GoogleCalendarApiEvent[] {
  if (Array.isArray(data)) return data;
  if (
    data &&
    typeof data === "object" &&
    "events" in data &&
    Array.isArray((data as { events: unknown }).events)
  ) {
    return (data as { events: GoogleCalendarApiEvent[] }).events;
  }
  return [];
}

/**
 * Convert a Google Calendar API event to the UI CalEvent format
 */
export function mapGoogleEventToCalEvent(
  event: GoogleCalendarApiEvent,
  fallbackIndex = 0
): CalEvent {
  const startStr = event.start?.dateTime?.trim() || event.start?.date?.trim() || "";
  const endStr = event.end?.dateTime?.trim() || event.end?.date?.trim() || "";

  const startDate = startStr ? new Date(startStr) : new Date();
  const endDate = endStr ? new Date(endStr) : new Date(startDate.getTime() + 60 * 60 * 1000);

  // JS getDay(): 0=Sun, 1=Mon, ..., 6=Sat.
  // Our week view expects: 0=Mon, ..., 5=Sat, 6=Sun.
  const jsDay = startDate.getDay();
  const day = (jsDay + 6) % 7;

  const startH = startDate.getHours() + startDate.getMinutes() / 60;
  let endH = endDate.getHours() + endDate.getMinutes() / 60;
  if (endH <= startH) {
    endH = startH + 1.0;
  }

  // Determine event category
  const summaryLower = (event.summary || "").toLowerCase();
  let type: EventType = "meeting";
  if (
    summaryLower.includes("focus") ||
    summaryLower.includes("deep work") ||
    summaryLower.includes("code") ||
    summaryLower.includes("study")
  ) {
    type = "focus";
  } else if (
    summaryLower.includes("lunch") ||
    summaryLower.includes("gym") ||
    summaryLower.includes("dinner") ||
    summaryLower.includes("personal") ||
    summaryLower.includes("coffee")
  ) {
    type = "personal";
  }

  const attendees = event.attendees
    ?.map((a) => a.displayName || a.email || "")
    .filter(Boolean);

  return {
    id: event.id || `cal-${fallbackIndex}`,
    title: event.summary || "Untitled event",
    day,
    startH,
    endH,
    type,
    location: event.hangoutLink || event.location || undefined,
    attendees: attendees && attendees.length > 0 ? attendees : undefined,
    description: event.description || undefined,
    startDateIso: startStr || undefined,
  };
}

/**
 * Convert a Google Calendar API event to the RightPanel Today CalendarEvent format
 */
export function mapGoogleEventToTodayEvent(
  event: GoogleCalendarApiEvent,
  now: Date = new Date()
): CalendarEvent {
  const startStr = event.start?.dateTime || event.start?.date;
  const startDate = startStr ? new Date(startStr) : new Date();

  // Format time as "11:00 AM" or "All day"
  const timeStr = event.start?.dateTime
    ? startDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "All day";

  const summaryLower = (event.summary || "").toLowerCase();
  let type: EventType = "meeting";
  if (
    summaryLower.includes("focus") ||
    summaryLower.includes("deep work") ||
    summaryLower.includes("code") ||
    summaryLower.includes("study")
  ) {
    type = "focus";
  } else if (
    summaryLower.includes("lunch") ||
    summaryLower.includes("gym") ||
    summaryLower.includes("dinner") ||
    summaryLower.includes("personal") ||
    summaryLower.includes("coffee")
  ) {
    type = "personal";
  }

  const detail = event.hangoutLink
    ? "Google Meet"
    : event.location ||
      (event.attendees && event.attendees.length > 0
        ? `with ${event.attendees
            .map((a) => a.displayName || a.email?.split("@")[0])
            .filter(Boolean)
            .slice(0, 2)
            .join(" & ")}`
        : undefined);

  return {
    time: timeStr,
    label: event.summary || "Untitled event",
    type,
    detail,
    startIso: startStr,
  };
}

/** How long to wait between automatic background syncs (ms) */
const AUTO_SYNC_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

export function useCalendarEvents() {
  const [rawEvents, setRawEvents] = useState<GoogleCalendarApiEvent[]>([]);
  const [events, setEvents] = useState<CalEvent[]>([]);
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
      const res = await fetch("/api/calendar/events");
      if (!res.ok) {
        const errorData = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(errorData?.error || `Failed to fetch events (${res.status})`);
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
        const list = extractEvents(data);
        setRawEvents(list);
        if (list.length > 0) {
          setEvents(list.map((ev, i) => mapGoogleEventToCalEvent(ev, i)));
        }
      }
    } catch (err: unknown) {
      if (mountedRef.current) {
        const message = err instanceof Error ? err.message : "Failed to load calendar events";
        console.warn("useCalendarEvents fetchFromDb:", message);
        // Retain default CAL_EVENTS on initial error
      }
    } finally {
      if (mountedRef.current && !silent) setIsLoading(false);
    }
  }, []);

  // ── Sync from Google Calendar API ─────────────────────────────────────────
  const syncFromApi = useCallback(async () => {
    if (!mountedRef.current) return;
    setIsSyncing(true);
    setError(null);
    try {
      const res = await fetch("/api/calendar/events?sync=1");
      if (!res.ok) {
        const errorData = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(errorData?.error || `Sync failed (${res.status})`);
      }
      const data: unknown = await res.json();
      if (mountedRef.current) {
        const list = extractEvents(data);
        setRawEvents(list);
        if (list.length > 0) {
          setEvents(list.map((ev, i) => mapGoogleEventToCalEvent(ev, i)));
        }
        setLastSyncedAt(new Date());
      }
    } catch (err: unknown) {
      if (mountedRef.current) {
        const message = err instanceof Error ? err.message : "Calendar sync failed";
        console.warn("useCalendarEvents syncFromApi:", message);
        setError(message);
      }
    } finally {
      if (mountedRef.current) setIsSyncing(false);
    }
  }, []);

  // ── Mount: load from DB, try live sync, then auto-sync every 15 min ───────
  useEffect(() => {
    mountedRef.current = true;

    async function init() {
      try {
        await syncFromApi();
      } catch {
        await fetchFromDb();
      }
    }

    init();

    const timer = setInterval(() => {
      syncFromApi();
    }, AUTO_SYNC_INTERVAL_MS);

    return () => {
      mountedRef.current = false;
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Today's events for the RightPanel ────────────────────────────────────
  const todayEvents = useMemo<CalendarEvent[]>(() => {
    if (!Array.isArray(rawEvents) || rawEvents.length === 0) {
      return [];
    }

    const now = new Date();
    const todayYear = now.getFullYear();
    const todayMonth = now.getMonth();
    const todayDate = now.getDate();

    const filtered = rawEvents.filter((e) => {
      const startStr = e.start?.dateTime || e.start?.date;
      if (!startStr) return false;
      const d = new Date(startStr);
      return (
        d.getFullYear() === todayYear &&
        d.getMonth() === todayMonth &&
        d.getDate() === todayDate
      );
    });

    // Sort ascending by start time
    filtered.sort((a, b) => {
      const tA = new Date(a.start?.dateTime || a.start?.date || 0).getTime();
      const tB = new Date(b.start?.dateTime || b.start?.date || 0).getTime();
      return tA - tB;
    });

    const mapped = filtered.map((e) => mapGoogleEventToTodayEvent(e, now));

    // Determine the next upcoming event
    const nowMs = now.getTime();
    let foundNext = false;
    for (const ev of mapped) {
      if (ev.startIso) {
        const evMs = new Date(ev.startIso).getTime();
        if (evMs >= nowMs && !foundNext) {
          ev.isNext = true;
          foundNext = true;
          break;
        }
      }
    }

    if (!foundNext && mapped.length > 0) {
      mapped[0].isNext = true;
    }

    return mapped;
  }, [rawEvents]);

  const nextEvent = useMemo<CalendarEvent | null>(() => {
    return todayEvents.find((e) => e.isNext) || todayEvents[0] || null;
  }, [todayEvents]);

  return {
    events,
    rawEvents,
    todayEvents,
    nextEvent,
    isLoading,
    isSyncing,
    error,
    lastSyncedAt,
    refetch: () => fetchFromDb(),
    sync: syncFromApi,
  };
}

export { useCalendarEvents as useCalendar };

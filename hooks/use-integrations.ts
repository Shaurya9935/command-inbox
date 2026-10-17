"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { log } from "@/lib/logger";

export interface IntegrationStatuses {
  gmail: boolean;
  googlecalendar: boolean;
  [key: string]: boolean;
}

export function useIntegrations() {
  const [statuses, setStatuses] = useState<IntegrationStatuses>({
    gmail: false,
    googlecalendar: false,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [connectingApp, setConnectingApp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/integrations/status");
      if (!res.ok) {
        throw new Error(`Failed to fetch status (${res.status})`);
      }
      const data = await res.json();
      if (mountedRef.current && data?.statuses) {
        setStatuses(data.statuses);
      }
    } catch (err) {
      if (mountedRef.current) {
        log.warn("useIntegrations fetchStatus error", { error: err });
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const run = async () => {
      await fetchStatus();
    };
    run();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchStatus]);

  const connectService = useCallback(async (service: "gmail" | "calendar" | string) => {
    setConnectingApp(service);
    setError(null);
    try {
      const endpoint =
        service === "gmail"
          ? "/api/integrations/gmail/connect"
          : "/api/integrations/calendar/connect";

      const res = await fetch(endpoint, { method: "POST" });
      const data = await res.json();
      if (data?.connectUrl) {
        window.location.href = data.connectUrl;
        return;
      }
      throw new Error(data?.error || "Failed to get authorization URL");
    } catch (err) {
      if (mountedRef.current) {
        const msg = err instanceof Error ? err.message : "Connection failed";
        setError(msg);
        setConnectingApp(null);
      }
    }
  }, []);

  return {
    statuses,
    isGmailConnected: Boolean(statuses.gmail),
    isCalendarConnected: Boolean(statuses.googlecalendar),
    isLoading,
    connectingApp,
    isConnectingGmail: connectingApp === "gmail",
    isConnectingCalendar: connectingApp === "calendar",
    error,
    connectGmail: () => connectService("gmail"),
    connectCalendar: () => connectService("calendar"),
    refresh: fetchStatus,
  };
}

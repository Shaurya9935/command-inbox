"use client";

import { useSyncExternalStore } from "react";

let currentTime = 0;
const listeners = new Set<() => void>();
let intervalId: ReturnType<typeof setInterval> | null = null;

function subscribe(callback: () => void) {
  listeners.add(callback);
  if (!intervalId && typeof window !== "undefined") {
    currentTime = Date.now();
    intervalId = setInterval(() => {
      currentTime = Date.now();
      listeners.forEach((cb) => cb());
    }, 30_000);
  }
  return () => {
    listeners.delete(callback);
    if (listeners.size === 0 && intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
}

function getSnapshot() {
  if (currentTime === 0 && typeof window !== "undefined") {
    currentTime = Date.now();
  }
  return currentTime;
}

function getServerSnapshot() {
  return 0;
}

export function useCurrentTime(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

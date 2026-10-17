import { EventStyle, EventType } from "./types";

export const HOUR_PX = 64;
export const GRID_START = 6;  // 6 AM
export const GRID_END = 22;   // 10 PM

/**
 * Style map for event types.
 */
export const EV_S: Record<EventType, EventStyle> = {
  meeting: {
    bg: "var(--event-meeting-bg)",
    border: "var(--event-meeting-border)",
    text: "var(--event-meeting-text)",
    bar: "var(--event-meeting-bar)",
  },
  focus: {
    bg: "var(--event-focus-bg)",
    border: "var(--event-focus-border)",
    text: "var(--event-focus-text)",
    bar: "var(--event-focus-bar)",
  },
  personal: {
    bg: "var(--event-personal-bg)",
    border: "var(--event-personal-border)",
    text: "var(--event-personal-text)",
    bar: "var(--event-personal-bar)",
  },
};

// NOTE: WEEK_DAYS, SEP_CELLS, CAL_EVENTS, NOW_H are intentionally removed.
// All date/time values are computed dynamically in calendar-workspace.tsx
// using the helpers in ./date-utils.ts.

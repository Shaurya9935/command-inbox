import { EventStyle, EventType } from "./types";

export const HOUR_PX = 64;
export const GRID_START = 6;  // 6 AM
export const GRID_END = 22;   // 10 PM

/**
 * Style map for event types.
 */
export const EV_S: Record<EventType, EventStyle> = {
  meeting: { bg: "#EDEAFB", border: "#C4BFF0", text: "#5549C0", bar: "#7B72D4" },
  focus:   { bg: "#EEF4F1", border: "#B8D4C0", text: "#3E7868", bar: "#8BAE92" },
  personal:{ bg: "#F5F0E8", border: "#DDD0BE", text: "#7A6A50", bar: "#C5B49A" },
};

// NOTE: WEEK_DAYS, SEP_CELLS, CAL_EVENTS, NOW_H are intentionally removed.
// All date/time values are computed dynamically in calendar-workspace.tsx
// using the helpers in ./date-utils.ts.

/**
 * date-utils.ts
 * Pure helpers for calendar date/time math. No React deps.
 */

import { WeekDay, MonthCell } from "./types";

/** Today as a plain Date (midnight local) */
export function today(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Current fractional hour (e.g. 14.5 = 2:30 PM) */
export function nowHour(): number {
  const n = new Date();
  return n.getHours() + n.getMinutes() / 60;
}

/** Add `n` days to a Date, returning a new Date */
export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

/** Monday of the week that contains `d` (Mon-first grid) */
export function mondayOf(d: Date): Date {
  const day = d.getDay(); // 0=Sun … 6=Sat
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  return addDays(d, diff);
}

const SHORT_MONTH = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];
const SHORT_DAY = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const LONG_DAY  = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const LONG_MONTH = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

/** WeekDay[] for the 7-day Mon..Sun row starting at `monday` */
export function buildWeekDays(monday: Date, todayDate: Date): WeekDay[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(monday, i);
    return {
      label: SHORT_DAY[i],
      dateNum: d.getDate(),
      monthStr: SHORT_MONTH[d.getMonth()],
      isToday:
        d.getFullYear() === todayDate.getFullYear() &&
        d.getMonth() === todayDate.getMonth() &&
        d.getDate() === todayDate.getDate(),
      fullDate: d,
    };
  });
}

/** "Aug 31 – Sep 6, 2026" style title for a week */
export function weekTitle(monday: Date): string {
  const sunday = addDays(monday, 6);
  const sameMonth = monday.getMonth() === sunday.getMonth();
  const sameYear = monday.getFullYear() === sunday.getFullYear();

  const startStr = sameMonth
    ? `${SHORT_MONTH[monday.getMonth()]} ${monday.getDate()}`
    : `${SHORT_MONTH[monday.getMonth()]} ${monday.getDate()}`;

  const endStr = sameYear
    ? `${SHORT_MONTH[sunday.getMonth()]} ${sunday.getDate()}, ${sunday.getFullYear()}`
    : `${SHORT_MONTH[sunday.getMonth()]} ${sunday.getDate()}, ${sunday.getFullYear()}`;

  return `${startStr} – ${endStr}`;
}

/** "Thursday, Sep 4" style title for a single day */
export function dayTitle(d: Date): string {
  const dow = d.getDay(); // 0=Sun
  const longDayIdx = dow === 0 ? 6 : dow - 1; // convert to Mon=0 index
  return `${LONG_DAY[longDayIdx]}, ${SHORT_MONTH[d.getMonth()]} ${d.getDate()}`;
}

/** "September 2026" style title */
export function monthTitle(d: Date): string {
  return `${LONG_MONTH[d.getMonth()]} ${d.getFullYear()}`;
}

/** Format a Date to the unique cell key format e.g. "Sep-4-2026" */
export function formatDateKey(d: Date): string {
  return `${SHORT_MONTH[d.getMonth()]}-${d.getDate()}-${d.getFullYear()}`;
}

/**
 * MonthCell[] for a full Mon-first calendar month grid.
 * Always 6 rows (42 cells) so the layout stays stable.
 */
export function buildMonthCells(year: number, month: number, todayDate: Date): MonthCell[] {
  // First day of month
  const first = new Date(year, month, 1);
  // Monday of the week containing the 1st
  const gridStart = mondayOf(first);

  const cells: MonthCell[] = [];
  for (let i = 0; i < 42; i++) {
    const d = addDays(gridStart, i);
    const inMonth = d.getMonth() === month;
    const isToday =
      d.getFullYear() === todayDate.getFullYear() &&
      d.getMonth() === todayDate.getMonth() &&
      d.getDate() === todayDate.getDate();

    cells.push({
      date: d.getDate(),
      mlabel: SHORT_MONTH[d.getMonth()],
      inMonth,
      isToday,
      key: formatDateKey(d),
      fullDate: d,
    });
  }
  return cells;
}

/**
 * Given start and optional end ISO strings, returns all "Sep-4-2026" cell keys the event covers.
 */
export function getEventDateKeys(startDateIso: string, endDateIso?: string): string[] {
  const start = parseEventDate(startDateIso);
  if (!endDateIso) {
    return [formatDateKey(start)];
  }

  const isAllDay = !startDateIso.includes("T");
  let end = parseEventDate(endDateIso);

  if (isAllDay) {
    // End date is exclusive in Google Calendar all-day events (e.g. 2026-09-04 to 2026-09-05 is just Sep 4)
    end = addDays(end, -1);
  } else {
    // Timed event ending at midnight (00:00) of next day belongs to previous day
    if (end.getHours() === 0 && end.getMinutes() === 0 && end.getTime() > start.getTime()) {
      end = addDays(end, -1);
    }
  }

  const keys: string[] = [];
  let curr = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const targetEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate());

  let count = 0;
  while (curr <= targetEnd && count < 31) {
    keys.push(formatDateKey(curr));
    curr = addDays(curr, 1);
    count++;
  }

  return keys.length > 0 ? keys : [formatDateKey(start)];
}

/**
 * Return the 0-based Mon-first day index (0=Mon … 6=Sun)
 * for a JS Date. This is what CalEvent.day uses.
 */
export function monFirstDayIndex(d: Date): number {
  return (d.getDay() + 6) % 7;
}

/**
 * True if two dates fall on the same calendar day.
 */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Parse a Google Calendar start/end string into a local Date.
 *
 * - Full ISO datetime strings (e.g. "2026-09-09T10:00:00+05:30") are parsed
 *   normally — the browser correctly applies the timezone offset.
 * - Date-only strings (e.g. "2026-09-09") are all-day events and must be
 *   treated as LOCAL midnight, not UTC midnight (which would shift the date
 *   by one day for users east of UTC+0).
 */
export function parseEventDate(iso: string): Date {
  // All-day: YYYY-MM-DD (no T, no Z, no colon in the offset)
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [y, mo, d] = iso.split("-").map(Number);
    return new Date(y, mo - 1, d); // local midnight
  }
  // Timed event — parse as-is (offset included)
  return new Date(iso);
}


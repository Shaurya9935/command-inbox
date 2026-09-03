import { CalEvent, EventStyle, EventType, MonthCell, WeekDay } from "./types";

export const HOUR_PX = 64;
export const GRID_START = 8; // 8 AM
export const GRID_END = 20; // 8 PM
export const NOW_H = 16.75; // 4:45 PM (current time)

export const WEEK_DAYS: WeekDay[] = [
  { label: "Mon", dateNum: 31, monthStr: "Aug", isToday: false },
  { label: "Tue", dateNum: 1, monthStr: "Sep", isToday: false },
  { label: "Wed", dateNum: 2, monthStr: "Sep", isToday: false },
  { label: "Thu", dateNum: 3, monthStr: "Sep", isToday: true },
  { label: "Fri", dateNum: 4, monthStr: "Sep", isToday: false },
  { label: "Sat", dateNum: 5, monthStr: "Sep", isToday: false },
  { label: "Sun", dateNum: 6, monthStr: "Sep", isToday: false },
];

export const CAL_EVENTS: CalEvent[] = [
  { id: 1, title: "Focus time", day: 0, startH: 9.5, endH: 11.0, type: "focus" },
  {
    id: 2,
    title: "1:1 with Jordan",
    day: 1,
    startH: 10.0,
    endH: 10.5,
    type: "meeting",
    location: "Google Meet",
    attendees: ["Jordan K.", "Shaurya G."],
  },
  {
    id: 3,
    title: "Team sync",
    day: 1,
    startH: 11.0,
    endH: 12.0,
    type: "meeting",
    location: "Google Meet",
    attendees: ["Sarah C.", "Alex M.", "Lena P.", "Shaurya G."],
  },
  { id: 4, title: "Lunch", day: 2, startH: 12.5, endH: 13.25, type: "personal" },
  {
    id: 5,
    title: "Design critique",
    day: 2,
    startH: 14.0,
    endH: 15.0,
    type: "meeting",
    attendees: ["Sarah C.", "Lena P.", "Shaurya G."],
  },
  {
    id: 6,
    title: "Project review",
    day: 3,
    startH: 15.5,
    endH: 16.5,
    type: "meeting",
    attendees: ["Sarah C.", "Alex M."],
  },
  { id: 7, title: "Gym", day: 3, startH: 18.0, endH: 19.0, type: "personal" },
  {
    id: 8,
    title: "Sprint planning",
    day: 4,
    startH: 9.0,
    endH: 10.5,
    type: "meeting",
    location: "Google Meet",
    attendees: ["Sarah C.", "Alex M.", "Lena P.", "Shaurya G."],
  },
  { id: 9, title: "Happy hour", day: 4, startH: 17.5, endH: 18.5, type: "personal" },
  { id: 10, title: "Family brunch", day: 6, startH: 11.0, endH: 13.0, type: "personal" },
];

export const EV_S: Record<EventType, EventStyle> = {
  meeting: { bg: "#EDEAFB", border: "#C4BFF0", text: "#5549C0", bar: "#7B72D4" },
  focus: { bg: "#EEF4F1", border: "#B8D4C0", text: "#3E7868", bar: "#8BAE92" },
  personal: { bg: "#F5F0E8", border: "#DDD0BE", text: "#7A6A50", bar: "#C5B49A" },
};

// September 2026 month cells (Mon-first, 5 weeks)
// Sep 1 = Tuesday → first Mon in view = Aug 31
export const SEP_CELLS: MonthCell[] = [
  { date: 31, mlabel: "Aug", inMonth: false, key: "Aug-31" },
  ...Array.from({ length: 30 }, (_, i) => ({
    date: i + 1,
    mlabel: "Sep",
    inMonth: true,
    isToday: i + 1 === 3,
    key: `Sep-${i + 1}`,
  })),
  ...Array.from({ length: 4 }, (_, i) => ({
    date: i + 1,
    mlabel: "Oct",
    inMonth: false,
    key: `Oct-${i + 1}`,
  })),
];

export const MONTH_EV: Record<string, { title: string; type: EventType }[]> = {
  "Aug-31": [{ title: "Focus time", type: "focus" }],
  "Sep-1": [
    { title: "1:1 Jordan", type: "meeting" },
    { title: "Team sync", type: "meeting" },
  ],
  "Sep-2": [
    { title: "Lunch", type: "personal" },
    { title: "Design critique", type: "meeting" },
  ],
  "Sep-3": [
    { title: "Project review", type: "meeting" },
    { title: "Gym", type: "personal" },
  ],
  "Sep-4": [
    { title: "Sprint planning", type: "meeting" },
    { title: "Happy hour", type: "personal" },
  ],
  "Sep-6": [{ title: "Family brunch", type: "personal" }],
  "Sep-8": [{ title: "Team weekly", type: "meeting" }],
  "Sep-10": [{ title: "Product review", type: "meeting" }],
  "Sep-14": [{ title: "Focus block", type: "focus" }],
  "Sep-15": [{ title: "Design sprint", type: "meeting" }],
  "Sep-17": [{ title: "All hands", type: "meeting" }],
  "Sep-22": [{ title: "Product demo", type: "meeting" }],
  "Sep-25": [{ title: "Happy hour", type: "personal" }],
  "Sep-29": [{ title: "Sprint review", type: "meeting" }],
};

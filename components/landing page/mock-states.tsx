import { ApprovalCard } from "./approval-card";

export function DashboardState() {
  const prompts = [
    "Show emails I need to reply to",
    "What’s on my calendar today?",
    "Schedule a meeting with Priya",
    "Find unread emails from this week",
  ];
  return (
    <div className="state-content">
      <p className="mono-label mb-3">Thursday · AI assistant active</p>
      <h3 className="text-[24px] font-semibold tracking-[-0.04em]">
        Good morning, Alex.
      </h3>
      <p className="mt-1 text-[12px] text-muted">
        What would you like to take care of?
      </p>
      <div className="command-box mt-5">
        <span className="text-accent">⌘</span>
        <span>Ask anything about your email or schedule…</span>
        <kbd>⌘ K</kbd>
      </div>
      <p className="mono-label mb-2 mt-5">Suggested prompts</p>
      <div className="grid gap-1.5 text-[11px] text-muted">
        {prompts.map((prompt) => (
          <p key={prompt}>
            <span className="mr-2 text-accent">↗</span>
            {prompt}
          </p>
        ))}
      </div>
      <p className="mono-label mb-2 mt-6">Your focus</p>
      <div className="grid grid-cols-2 gap-x-5 gap-y-2 text-[11px]">
        <div className="stat">
          <strong>28</strong> emails need attention
        </div>
        <div className="stat">
          <strong>4</strong> meetings today
        </div>
        <div className="stat">
          <strong>2</strong> drafts waiting
        </div>
        <div className="stat">
          <strong>2h</strong> until your next meeting
        </div>
      </div>
    </div>
  );
}

const emails = [
  [
    "Priya Shah",
    "Re: Project review",
    "Could we move our conversation to this afternoon?",
    "9:42 AM",
  ],
  [
    "Marcus Chen",
    "Q2 planning notes",
    "I added the open questions for tomorrow’s review.",
    "8:18 AM",
  ],
  [
    "Nora Bell",
    "Launch checklist",
    "Two items still need your approval before we publish.",
    "Yesterday",
  ],
];

export function ResultsState({ typed = true }: { typed?: boolean }) {
  return (
    <div className="state-content">
      <p className="mono-label mb-4">Command · Gmail</p>
      <div className="command-box border-accent/25 shadow-[0_8px_30px_var(--accent-tint)]">
        <span className="text-accent">⌘</span>
        <span>
          {typed
            ? "Show emails I need to reply to"
            : "Show emails I need to reply to"}
        </span>
        <span className="ml-auto size-2 animate-pulse rounded-full bg-accent" />
      </div>
      <div className="mt-5 flex items-end justify-between">
        <div>
          <h3 className="text-[18px] font-semibold tracking-tight">
            3 messages need a reply
          </h3>
          <p className="mt-1 text-[10px] text-muted">
            Sorted by urgency and relationship
          </p>
        </div>
        <span className="rounded-full bg-tint px-2 py-1 text-[9px] font-medium text-accent">
          Gmail
        </span>
      </div>
      <div className="mt-3 overflow-hidden rounded-xl border border-line bg-white">
        {emails.map(([sender, subject, snippet, time], index) => (
          <div
            key={sender}
            className={`grid grid-cols-[28px_1fr_auto] gap-3 px-3.5 py-3 ${
              index ? "border-t border-line" : ""
            }`}
          >
            <span className="grid size-7 place-items-center rounded-full bg-[var(--surface-raised)] text-[9px] font-semibold">
              {sender
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
            <div className="min-w-0">
              <div className="flex gap-2 text-[10px]">
                <strong>{sender}</strong>
                <span className="font-medium">{subject}</span>
              </div>
              <p className="mt-0.5 truncate text-[9px] text-muted">{snippet}</p>
            </div>
            <time className="font-mono text-[8px] text-muted">{time}</time>
          </div>
        ))}
      </div>
    </div>
  );
}

const days = ["MON 12", "TUE 13", "WED 14", "THU 15", "FRI 16"];

export function CalendarState() {
  return (
    <div className="state-content h-full">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="mono-label mb-1">Calendar</p>
          <h3 className="text-[20px] font-semibold tracking-tight">
            October 12–16
          </h3>
        </div>
        <span className="rounded-lg border border-line px-2.5 py-1 text-[9px] text-muted">
          Week
        </span>
      </div>
      <div className="calendar">
        <div className="calendar-head">
          <span />
          {days.map((day) => (
            <span key={day} className={day.includes("15") ? "text-accent" : ""}>
              {day}
            </span>
          ))}
        </div>
        <div className="calendar-body">
          <div className="time-axis">
            {["9 AM", "10 AM", "11 AM", "12 PM", "1 PM"].map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
          <div className="calendar-grid" />
          <div className="event-block left-[61%] top-[17%] h-[27%]">
            <strong>Meeting with Priya Shah</strong>
            <span>10:00–11:00 AM</span>
            <em>Google Meet</em>
          </div>
          <div className="event-muted left-[21%] top-[58%]">
            Team review · 12 PM
          </div>
          <div className="live-line top-[48%]">
            <span />
            11:24
          </div>
        </div>
      </div>
    </div>
  );
}

export function ApprovalState({ approved = false }: { approved?: boolean }) {
  return (
    <div className="state-content">
      <p className="mono-label mb-3">Proposed actions</p>
      <h3 className="text-[20px] font-semibold tracking-tight">
        Ready for your review
      </h3>
      <p className="mt-1 text-[11px] text-muted">
        Nexus never sends or schedules without your approval.
      </p>
      <div className="mt-4 max-w-[410px]">
        <ApprovalCard approved={approved} />
      </div>
    </div>
  );
}

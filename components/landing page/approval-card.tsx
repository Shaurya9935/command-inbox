export function ApprovalCard({
  approved = false,
  compact = false,
}: {
  approved?: boolean;
  compact?: boolean;
}) {
  return (
    <div className={`approval-card ${compact ? "approval-card--compact" : ""}`}>
      <div className="mb-3 flex items-center justify-between">
        <span className="mono-label">Review before sending</span>
        <span className="rounded-full bg-tint px-2 py-1 text-[8px] font-semibold text-accent">
          2 actions
        </span>
      </div>
      <dl className="grid grid-cols-[50px_1fr] gap-y-1.5 text-[10px]">
        <dt className="text-muted">To</dt>
        <dd>Priya Shah</dd>
        <dt className="text-muted">Subject</dt>
        <dd>Today at 4 PM</dd>
      </dl>
      <p className="my-3 rounded-lg bg-[var(--surface-raised)] p-3 text-[10px] leading-relaxed text-muted">
        Hi Priya, I’m free at 4 PM today. I’ve added time to our calendars.
      </p>
      <div className="mb-3 flex items-center gap-2 border-t border-line pt-3 text-[9px]">
        <span className="grid size-7 place-items-center rounded-lg bg-tint text-accent">
          15
        </span>
        <span>
          <strong className="block text-ink">Meeting with Priya Shah</strong>
          Today, 4:00–4:30 PM
        </span>
      </div>
      <div className="flex gap-2">
        <button
          className={`flex-1 rounded-lg py-2 text-[10px] font-semibold transition-colors ${
            approved ? "bg-[var(--success-tint)] text-[var(--success-hover)]" : "bg-accent text-white"
          }`}
        >
          {approved ? "✓ Sent and scheduled" : "Approve"}
        </button>
        {!approved && (
          <button className="rounded-lg border border-line px-4 py-2 text-[10px] font-medium">
            Edit
          </button>
        )}
      </div>
    </div>
  );
}

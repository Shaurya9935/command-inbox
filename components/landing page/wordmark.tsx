export function Mark() {
  return (
    <span className="grid size-7 place-items-center rounded-lg bg-ink text-[15px] font-semibold text-white">
      &gt;
    </span>
  );
}

export function Wordmark({ inverse = false }: { inverse?: boolean }) {
  return (
    <span
      className={`flex items-center gap-2.5 font-semibold tracking-tight ${
        inverse ? "text-white" : "text-ink"
      }`}
    >
      <Mark />
      Nexus
    </span>
  );
}

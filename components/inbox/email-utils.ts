import { GmailThread } from "@/hooks/use-gmail";
import { Email } from "@/components/dashboard/types";

export const PALETTE_COLORS = [
  "var(--avatar-1)",
  "var(--avatar-2)",
  "var(--avatar-3)",
  "var(--avatar-4)",
  "var(--avatar-5)",
  "var(--avatar-6)",
];

export function formatSenderName(fromRaw: string): string {
  if (!fromRaw) return "Unknown sender";
  const match = fromRaw.match(/^(.*?)\s*<.*?>$/);
  if (match && match[1]?.trim()) {
    return match[1].replace(/^["']|["']$/g, "").trim();
  }
  if (fromRaw.includes("@") && !fromRaw.includes(" ")) {
    return fromRaw.split("@")[0];
  }
  return fromRaw.trim();
}

export function formatEmailTime(dateVal: string | Date | undefined): string {
  if (!dateVal) return "Recent";
  const date = new Date(dateVal);
  if (isNaN(date.getTime())) return "Recent";

  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  const isThisYear = date.getFullYear() === now.getFullYear();
  if (isThisYear) {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }

  return date.toLocaleDateString([], { month: "numeric", day: "numeric", year: "2-digit" });
}

export function mapThreadToEmail(thread: GmailThread, index: number): Email {
  const data = thread?.data || thread || {};
  const id = thread?.entity_id || thread?.id || data?.id || `thread-${index}`;
  const snippet = data?.snippet || thread?.snippet || "";
  const rawFrom = data?.from || thread?.from || "";
  const from = formatSenderName(rawFrom);
  const subject =
    data?.subject ||
    thread?.subject ||
    (snippet
      ? snippet.length > 40
        ? snippet.slice(0, 40) + "…"
        : snippet
      : `Thread #${String(id).slice(0, 6)}`);
  const preview = snippet || data?.body || "No preview available";

  const initials =
    from
      .split(" ")
      .map((w: string) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "GM";

  const color = PALETTE_COLORS[index % PALETTE_COLORS.length];

  const dateVal =
    thread?.created_at ||
    data?.created_at ||
    thread?.createdAt ||
    data?.createdAt;
  const time = formatEmailTime(dateVal);

  const unread =
    thread?.unread !== undefined
      ? Boolean(thread.unread)
      : data?.unread !== undefined
      ? Boolean(data?.unread)
      : true;
  const tag = data?.tag || (unread ? "Needs reply" : "Inbox");
  const body = thread?.body || data?.body || "";
  const bodyHtml = thread?.bodyHtml || data?.bodyHtml || "";

  return {
    id,
    from,
    initials,
    color,
    subject,
    preview,
    time,
    unread,
    tag,
    starred: true,
    body,
    bodyHtml,
  };
}

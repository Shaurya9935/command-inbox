import { Agent, run, tool, MaxTurnsExceededError } from "@openai/agents";
import type { AgentInputItem, Tool, ToolInputParameters } from "@openai/agents";
import { OpenAIAgentsProvider } from "@corsair-dev/mcp";
import { z } from "zod";

import { corsair } from "@/lib/corsair";
import {
  getInboxThreadsFromDb,
  parseMessagePart,
  type GmailMessage,
  type GmailHeader,
} from "@/features/gmail/server";
import { db } from "@/lib/db";
import { corsairEntities, corsairAccounts, corsairIntegrations } from "@/db/corsair";
import { and, eq, desc } from "drizzle-orm";

export type ChatTurn = { role: "user" | "assistant"; content: string };

type RunCommandParams = {
  tenantId: string;
  message: string;
  history?: ChatTurn[];
};

// @corsair-dev/mcp hardcodes `strict: false` when calling tool(), but
// @openai/agents v0.17 requires strict: true for Standard Schema parameters
// (Zod v4's toJSONSchema output carries a ~standard marker). We wrap tool()
// to always coerce strict to true so both libraries work together.
function strictTool<T extends ToolInputParameters>(
  options: Parameters<typeof tool<T>>[0],
): Tool<unknown> {
  return tool({ ...options, strict: true } as Parameters<typeof tool<T>>[0]);
}

// ── Result shapes ─────────────────────────────────────────────────────────────

interface EmailResult {
  from: string;
  subject: string;
  date: string;
  snippet: string;
  unread: boolean;
}

interface CalendarEventResult {
  title: string;
  start: string;
  end: string;
  location: string | null;
  meetLink: string | null;
}

// Trim a snippet to max N chars without cutting mid-word
function trimSnippet(s: string, max = 150): string {
  if (!s) return "";
  if (s.length <= max) return s;
  return s.slice(0, max).trimEnd() + "…";
}

// ── Tool builders ─────────────────────────────────────────────────────────────
// tenantCorsair is created once in runCommand and passed in here.

type TenantCorsair = ReturnType<typeof corsair.withTenant>;

function buildReadTools(tenantId: string, tenantCorsair: TenantCorsair): Tool<unknown>[] {

  // ── get_recent_emails ──────────────────────────────────────────────────────
  const getRecentEmails = strictTool({
    name: "get_recent_emails",
    description:
      "Return the most recent emails from the user's Gmail inbox. Use this for any request about recent or latest emails.",
    parameters: z.object({
      limit: z
        .number()
        .int()
        .min(1)
        .max(10)
        .describe("How many emails to return (1–10)"),
    }),
    execute: async ({ limit }): Promise<string> => {
      try {
        const threads = await getInboxThreadsFromDb(tenantId);
        if (!threads.length) {
          return JSON.stringify({ emails: [], note: "no emails in local cache" });
        }
        const emails: EmailResult[] = threads.slice(0, limit).map((t) => ({
          from: t.from || "Unknown Sender",
          subject: t.subject || "No Subject",
          date: t.createdAt || new Date().toISOString(),
          snippet: trimSnippet(t.snippet || t.body || ""),
          unread: t.unread,
        }));
        return JSON.stringify({ emails });
      } catch (err) {
        return JSON.stringify({ error: String(err) });
      }
    },
  });

  // ── search_emails ──────────────────────────────────────────────────────────
  const searchEmails = strictTool({
    name: "search_emails",
    description:
      "Search Gmail using Gmail search syntax. Use for 'is:unread', 'from:alice', 'subject:invoice', 'newer_than:2d', etc. Returns matching emails.",
    parameters: z.object({
      query: z
        .string()
        .describe("Gmail search query e.g. 'is:unread', 'from:alice', 'subject:report newer_than:7d'"),
      limit: z
        .number()
        .int()
        .min(1)
        .max(10)
        .describe("Max results (1–10)"),
    }),
    execute: async ({ query, limit }): Promise<string> => {
      try {
        let rawThreads: { id?: string; snippet?: string; historyId?: string }[] = [];
        try {
          const res = await tenantCorsair.gmail.api.threads.list({
            q: query,
            maxResults: limit,
          });
          rawThreads = res?.threads ?? [];
        } catch (err) {
          return JSON.stringify({ error: `Gmail search failed: ${String(err)}` });
        }

        if (!rawThreads.length) {
          return JSON.stringify({ emails: [], note: "no matching emails" });
        }

        const emails: EmailResult[] = [];
        for (const t of rawThreads) {
          if (!t.id) continue;
          try {
            const full = await tenantCorsair.gmail.api.threads.get({ id: t.id, format: "full" });
            const messages: GmailMessage[] = full?.messages ?? [];

            const getHeader = (name: string): string | undefined => {
              for (const msg of [...messages].reverse()) {
                const h = (msg.payload?.headers ?? []).find(
                  (h: GmailHeader) => h.name?.toLowerCase() === name.toLowerCase()
                );
                if (h?.value) return h.value;
              }
              return undefined;
            };

            const from = getHeader("from") || "Unknown Sender";
            const subject = getHeader("subject") || t.snippet?.slice(0, 60) || "No Subject";
            const dateRaw = getHeader("date");
            const lastMsg = messages[messages.length - 1];
            const date = lastMsg?.internalDate
              ? new Date(Number(lastMsg.internalDate)).toISOString()
              : dateRaw
              ? new Date(dateRaw).toISOString()
              : new Date().toISOString();

            let rawSnippet = full?.snippet || t.snippet || "";
            if (!rawSnippet) {
              for (const msg of [...messages].reverse()) {
                const { text } = parseMessagePart(msg.payload);
                if (text) { rawSnippet = text; break; }
              }
            }

            const unread = messages.some((m: GmailMessage) => m.labelIds?.includes("UNREAD"));
            emails.push({ from, subject, date, snippet: trimSnippet(rawSnippet), unread });
          } catch {
            // skip threads we can't enrich
          }
        }

        if (!emails.length) {
          return JSON.stringify({ emails: [], note: "no matching emails" });
        }
        emails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return JSON.stringify({ emails });
      } catch (err) {
        return JSON.stringify({ error: String(err) });
      }
    },
  });

  // ── get_calendar_events ────────────────────────────────────────────────────
  const getCalendarEvents = strictTool({
    name: "get_calendar_events",
    description:
      "Return Google Calendar events in a date/time range. Dates must be ISO 8601 in Asia/Kolkata (+05:30). Use for any request about meetings, schedule, or events today/this week.",
    parameters: z.object({
      startISO: z
        .string()
        .describe("Range start as ISO 8601 e.g. '2025-10-14T00:00:00+05:30'"),
      endISO: z
        .string()
        .describe("Range end as ISO 8601 e.g. '2025-10-14T23:59:59+05:30'"),
    }),
    execute: async ({ startISO, endISO }): Promise<string> => {
      try {
        interface CalEventData {
          summary?: string;
          start?: { dateTime?: string; date?: string; timeZone?: string };
          end?: { dateTime?: string; date?: string; timeZone?: string };
          location?: string;
          hangoutLink?: string;
          status?: string;
        }

        // Try DB cache first
        const accts = await db
          .select({ id: corsairAccounts.id })
          .from(corsairAccounts)
          .innerJoin(corsairIntegrations, eq(corsairAccounts.integrationId, corsairIntegrations.id))
          .where(
            and(
              eq(corsairAccounts.tenantId, tenantId),
              eq(corsairIntegrations.name, "googlecalendar")
            )
          )
          .limit(1);
        const calendarAccountId = accts[0]?.id ?? null;

        let events: CalendarEventResult[] = [];

        if (calendarAccountId) {
          const rows = await db
            .select()
            .from(corsairEntities)
            .where(
              and(
                eq(corsairEntities.accountId, calendarAccountId),
                eq(corsairEntities.entityType, "events")
              )
            )
            .orderBy(desc(corsairEntities.updatedAt));

          const startMs = new Date(startISO).getTime();
          const endMs = new Date(endISO).getTime();

          for (const row of rows) {
            const d = (row.data ?? {}) as CalEventData;
            if (d.status === "cancelled") continue;
            const evStart = d.start?.dateTime || d.start?.date;
            const evEnd = d.end?.dateTime || d.end?.date;
            if (!evStart) continue;
            const evStartMs = new Date(evStart).getTime();
            if (isNaN(evStartMs) || evStartMs < startMs || evStartMs > endMs) continue;
            events.push({
              title: d.summary || "No Title",
              start: evStart,
              end: evEnd || evStart,
              location: d.location ?? null,
              meetLink: d.hangoutLink ?? null,
            });
          }
        }

        // Fallback to API if DB cache was empty
        if (!events.length) {
          try {
            const res = await tenantCorsair.googlecalendar.api.events.getMany({
              calendarId: "primary",
              maxResults: 50,
              singleEvents: true,
              orderBy: "startTime",
              timeMin: startISO,
              timeMax: endISO,
            });
            const raw = res?.items ?? [];
            events = (raw as Array<{
              status?: string;
              summary?: string;
              start?: { dateTime?: string; date?: string };
              end?: { dateTime?: string; date?: string };
              location?: string;
              hangoutLink?: string;
            }>)
              .filter((ev) => ev.status !== "cancelled")
              .map((ev) => ({
                title: ev.summary || "No Title",
                start: ev.start?.dateTime || ev.start?.date || startISO,
                end: ev.end?.dateTime || ev.end?.date || endISO,
                location: ev.location ?? null,
                meetLink: ev.hangoutLink ?? null,
              }));
          } catch (err) {
            return JSON.stringify({ error: `Calendar API failed: ${String(err)}` });
          }
        }

        if (!events.length) {
          return JSON.stringify({ events: [], note: "no events in this range" });
        }
        events.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
        return JSON.stringify({ events });
      } catch (err) {
        return JSON.stringify({ error: String(err) });
      }
    },
  });

  return [getRecentEmails, searchEmails, getCalendarEvents];
}

// ── Instruction string (~500 tokens) ──────────────────────────────────────────

function buildInstructions(): string {
  const nowIST = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  return `You are the AI assistant for Command Inbox. Respond ONLY to the latest user message.

READS — use the custom tools:
- Emails: use get_recent_emails (inbox list) or search_emails (Gmail search syntax: is:unread, from:X, subject:Y, newer_than:Nd).
- Calendar: use get_calendar_events with startISO/endISO in Asia/Kolkata (+05:30).
- Never use list_operations / run_script / gmail.db.* for reads.
- If a read tool returns an error, retry once. Only after a second failure say the lookup failed — never claim "no emails" on an error.
- Do not include URLs, links, or raw IDs in replies.

WRITES — use Corsair tools:
- For sending email, creating/editing/deleting events, labels, drafts: use list_operations → get_schema → run_script.
- Never guess a Corsair operation path. Only use paths confirmed by list_operations/get_schema.
- Execute every action the user requested. Report success/failure for each separately.

HISTORY:
- Earlier messages are context only. Never repeat a prior answer for a fresh data request.
- Retry operations that previously failed instead of echoing the old failure.

TIMEZONE: Asia/Kolkata (IST, +05:30). Interpret "today", "tomorrow", relative times in IST unless the user says otherwise.

OUTPUT:
- Be concise and natural. No raw IDs, no internal tool explanations.
- On multi-action requests: attempt all actions, then summarise what succeeded/failed.

Current time (IST): ${nowIST}`;
}

// ── Main entry point ──────────────────────────────────────────────────────────

const MAX_TURNS = 5;
const MAX_HISTORY = 8;
const ASSISTANT_SNIPPET_LIMIT = 800;

export async function runCommand({
  tenantId,
  message,
  history = [],
}: RunCommandParams): Promise<{ response: string }> {
  // Trim history to last 8 turns; cap long assistant messages
  const trimmedHistory = history.slice(-MAX_HISTORY).map((turn) =>
    turn.role === "assistant" && turn.content.length > ASSISTANT_SNIPPET_LIMIT
      ? { ...turn, content: turn.content.slice(0, ASSISTANT_SNIPPET_LIMIT) + "…" }
      : turn
  );

  const historyItems: AgentInputItem[] = trimmedHistory.map((turn) =>
    turn.role === "user"
      ? { role: "user", content: turn.content }
      : {
          role: "assistant",
          status: "completed",
          content: [{ type: "output_text", text: turn.content }],
        },
  );

  // Single tenant-scoped Corsair client shared by read tools and write tools
  const tenantCorsair = corsair.withTenant(tenantId);

  const customTools = buildReadTools(tenantId, tenantCorsair);

  const provider = new OpenAIAgentsProvider();
  const corsairTools = provider.build({
    corsair: tenantCorsair,
    tool: strictTool as typeof tool,
  });

  const agent = new Agent({
    name: "command-inbox",
    model: "gpt-4o",
    modelSettings: { temperature: 0 },
    instructions: buildInstructions(),
    tools: [...customTools, ...corsairTools],
  });

  const t0 = Date.now();
  let result;

  try {
    result = await run(agent, [...historyItems, { role: "user", content: message }], {
      maxTurns: MAX_TURNS,
    });
  } catch (err) {
    if (err instanceof MaxTurnsExceededError) {
      console.warn("[ai] max turns exceeded");
      return { response: "I couldn't complete that in time — please try rephrasing or breaking it into smaller steps." };
    }
    throw err;
  }

  const elapsedMs = Date.now() - t0;
  const llmCalls = result.rawResponses.length;
  const totalIn = result.rawResponses.reduce((s, r) => s + (r.usage?.inputTokens ?? 0), 0);
  const totalOut = result.rawResponses.reduce((s, r) => s + (r.usage?.outputTokens ?? 0), 0);
  console.log(
    `[ai] elapsed=${elapsedMs}ms llmCalls=${llmCalls} tokensIn=${totalIn} tokensOut=${totalOut}`
  );

  for (const item of result.newItems) {
    if (item.type === "tool_call_item") {
      console.log("[ai] TOOL CALL:", JSON.stringify(item.rawItem).slice(0, 400));
    }
    if (item.type === "tool_call_output_item") {
      console.log("[ai] TOOL OUT:", JSON.stringify(item.output).slice(0, 400));
    }
  }

  return { response: result.finalOutput ?? "" };
}

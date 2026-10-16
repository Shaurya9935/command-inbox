import { z } from "zod";
import type { Tool } from "@openai/agents";
import type { ToolContext } from "@/lib/ai/types";
import { strictTool } from "@/lib/ai/strict-tool";
import { extractAndValidateEmail } from "@/lib/validation/email";
import {
  getRecentEmails,
  searchEmailThreads,
  sendGmailMessage,
} from "./server";
import type { EmailResult } from "./types";

export function gmailTools(ctx: ToolContext): Tool<unknown>[] {
  const { tenantId, tenantCorsair } = ctx;

  // ── get_recent_emails ──────────────────────────────────────────────────────
  const getRecentEmailsTool = strictTool({
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
        const { emails, stale } = await getRecentEmails(tenantId, limit);
        if (!emails.length) {
          return JSON.stringify({
            emails: [],
            note: stale
              ? "Could not refresh from Gmail; results may be a few minutes old"
              : "no emails in local cache",
          });
        }
        if (stale) {
          return JSON.stringify({
            emails,
            note: "Could not refresh from Gmail; results may be a few minutes old",
          });
        }
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
      "Search Gmail using Gmail search syntax. Use for 'is:unread', 'from:alice', 'to:bob', 'subject:invoice', 'newer_than:2d', or name keywords. Returns matching emails with threadId and from/to addresses.",
    parameters: z.object({
      query: z
        .string()
        .describe("Gmail search query e.g. 'from:alice', 'to:bob', 'is:unread', 'subject:report newer_than:7d'"),
      limit: z
        .number()
        .int()
        .min(1)
        .max(10)
        .describe("Max results (1–10)"),
    }),
    execute: async ({ query, limit }): Promise<string> => {
      try {
        const emails: EmailResult[] = await searchEmailThreads({
          tenantCorsair,
          query,
          limit,
        });
        if (!emails.length) {
          return JSON.stringify({ emails: [], note: "no matching emails" });
        }
        return JSON.stringify({ emails });
      } catch (err) {
        return JSON.stringify({ error: `Gmail search failed: ${String(err)}` });
      }
    },
  });

  // ── send_email ─────────────────────────────────────────────────────────────
  const sendEmail = strictTool({
    name: "send_email",
    description:
      "ONLY for sending a new email or a reply. NEVER use this for drafts, forwarding, labels or any other mail action. Validates recipient address, formats RFC MIME, and initiates sending. If approval is required, notifies you that the action is waiting for approval.",
    parameters: z.object({
      to: z
        .string()
        .describe("Recipient real email address. Must be a valid email format, not a placeholder domain."),
      subject: z.string().describe("Subject of the email"),
      body: z.string().describe("Body text of the email in plain text"),
      threadId: z
        .string()
        .nullable()
        .describe("Gmail threadId if replying to an existing thread, otherwise null"),
      inReplyToMessageId: z
        .string()
        .nullable()
        .describe("Message-ID or message id to reference in In-Reply-To header if replying, otherwise null"),
    }),
    execute: async ({ to, subject, body, threadId, inReplyToMessageId }): Promise<string> => {
      // 1. Validate recipient email
      const emailCheck = extractAndValidateEmail(to);
      if (!emailCheck.valid || !emailCheck.email) {
        return JSON.stringify({ error: emailCheck.error });
      }
      const validatedTo = emailCheck.email;

      try {
        const res = await sendGmailMessage({
          tenantCorsair,
          to: validatedTo,
          subject,
          body,
          threadId,
          inReplyToMessageId,
        });

        return JSON.stringify({ sent: true, id: res?.id });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (
          (err instanceof Error && err.name === "PermissionRequiredError") ||
          msg.includes("waiting for the user's approval") ||
          msg.includes("approval")
        ) {
          // Return approval message as a normal tool result so model does not retry
          return JSON.stringify({
            status: "waiting_approval",
            message: msg,
          });
        }
        return JSON.stringify({ error: `Gmail send failed: ${msg}` });
      }
    },
  });

  return [getRecentEmailsTool, searchEmails, sendEmail];
}

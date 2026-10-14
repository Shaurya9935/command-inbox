import type { Tool } from "@openai/agents";
import type { ToolContext } from "@/lib/ai/types";
import { gmailTools } from "@/features/gmail/ai-tools";
import { calendarTools } from "@/features/calendar/ai-tools";

export function buildTools(ctx: ToolContext): Tool<unknown>[] {
  return [...gmailTools(ctx), ...calendarTools(ctx)];
}

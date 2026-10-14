import { tool } from "@openai/agents";
import type { Tool, ToolInputParameters } from "@openai/agents";

// @corsair-dev/mcp hardcodes `strict: false` when calling tool(), but
// @openai/agents v0.17 requires strict: true for Standard Schema parameters
// (Zod v4's toJSONSchema output carries a ~standard marker). We wrap tool()
// to always coerce strict to true so both libraries work together.
export function strictTool<T extends ToolInputParameters>(
  options: Parameters<typeof tool<T>>[0],
): Tool<unknown> {
  return tool({ ...options, strict: true } as Parameters<typeof tool<T>>[0]);
}

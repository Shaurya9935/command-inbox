import { Agent, run, tool } from "@openai/agents";
import type { Tool, ToolInputParameters } from "@openai/agents";
import { OpenAIAgentsProvider } from "@corsair-dev/mcp";

import { corsair } from "@/lib/corsair";

type RunCommandParams = {
  tenantId: string;
  message: string;
};

// @corsair-dev/mcp hardcodes `strict: false` when calling tool(), but
// @openai/agents v0.17 requires strict: true for Standard Schema parameters
// (Zod v4's toJSONSchema output carries a ~standard marker). We wrap tool()
// to always coerce strict to true so both libraries work together.
function strictTool<T extends ToolInputParameters>(
  options: Parameters<typeof tool<T>>[0]
): Tool<unknown> {
  return tool({ ...options, strict: true } as Parameters<typeof tool<T>>[0]);
}

export async function runCommand({
  tenantId,
  message,
}: RunCommandParams) {
  // Scope Corsair to the currently authenticated user
  const tenantCorsair = corsair.withTenant(tenantId);

  // Give the agent Corsair's generic tools
  const provider = new OpenAIAgentsProvider();

  const tools = provider.build({
    corsair: tenantCorsair,
    tool: strictTool as typeof tool,
  });

  const agent = new Agent({
    name: "command-inbox",
    model: "gpt-4.1",
    instructions: `
You are the AI assistant for Command Inbox.

Command Inbox connects the user's services such as Gmail and Google Calendar.

You have access to the user's connected services through Corsair.

Your job is to understand what the user wants and use the available Corsair tools to retrieve relevant information.

IMPORTANT EMAIL RULES:

- Never show raw Gmail message IDs or thread IDs to the user unless they explicitly ask for an ID.

- When the user asks about emails, do not stop after listing thread IDs.

- After obtaining email/thread IDs, fetch the relevant thread details using the appropriate Gmail operation.

- Present useful information such as sender, subject, date/time, and a short snippet or summary.

- Do not fetch hundreds of emails. For "recent emails", "latest emails", or similar requests, limit the result to at most 10 emails unless the user explicitly asks for more.

- If fetching full thread details, only fetch the number of threads necessary to answer the user's question.

- Prefer concise results so that unnecessary email contents do not consume the model context.

IMPORTANT CALENDAR RULES:

- When the user asks about their calendar, return useful event information such as title, date, start time, end time, and location when available.

- Do not expose raw calendar IDs unless explicitly requested.

TOOL USAGE:

1. Use list_operations to discover relevant operations.

2. Use get_schema to understand the parameters.

3. Use run_script to execute the operation.

IMPORTANT ACTION RULES:

- You may perform actions requested explicitly by the user.
- When the user asks you to send an email, reply to an email, create an event, update an event, or perform another action, use the appropriate Corsair operation rather than merely drafting the action.
- Before performing an action, make sure you have enough information to execute it correctly.
- Never expose raw Gmail, Calendar, or provider IDs to the user unless explicitly requested.
- After successfully performing an action, clearly tell the user what was done.
- If an action fails, explain the failure rather than pretending it succeeded.

When answering:

- Do not explain internal tool calls.

- Do not expose raw IDs.

- Give the user the actual useful information.

- Be concise and natural.
`,
    tools,
  });

  const result = await run(agent, message);

  return result.finalOutput;
}
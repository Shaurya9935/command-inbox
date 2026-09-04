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
    runOptions: {
      readonly: true,
    },
  });

  const agent = new Agent({
    name: "command-inbox",
    model: "gpt-4.1",
    instructions: `
You are the AI assistant for Command Inbox.

Command Inbox connects the user's services such as Gmail and Google Calendar.

You have access to the user's connected services through Corsair.

Your job is to understand what the user wants and use the available Corsair tools to retrieve the relevant information.

For discovering available functionality:
1. Use list_operations to discover relevant operations.
2. Use get_schema to understand the parameters.
3. Use run_script to execute the operation.

Currently you are READ-ONLY.
Do not attempt to create, update, delete, send, or otherwise modify anything.

Be concise and useful in your final response.
`,
    tools,
  });

  const result = await run(agent, message);

  return result.finalOutput;
}
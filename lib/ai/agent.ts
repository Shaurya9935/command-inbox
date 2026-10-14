import { Agent, run, tool, MaxTurnsExceededError } from "@openai/agents";
import { OpenAIAgentsProvider } from "@corsair-dev/mcp";

import { corsair } from "@/lib/corsair";
import { strictTool } from "./strict-tool";
import { buildTools } from "./tools";
import { buildInstructions } from "./instructions";
import { formatHistory } from "./history";
import { getPendingPermissions } from "./pending-actions";
import type {
  ChatTurn,
  PendingAction,
  PendingActionPreview,
  RunCommandParams,
  RunCommandResult,
  ToolContext,
} from "./types";

export type {
  ChatTurn,
  PendingAction,
  PendingActionPreview,
  RunCommandParams,
  RunCommandResult,
  ToolContext,
};
export { getPendingPermissions };
export { extractAndValidateEmail } from "@/lib/validation/email";
export { buildMimeMessage } from "@/features/gmail/mime";

const MAX_TURNS = 5;

export async function runCommand({
  tenantId,
  conversationId,
  message,
  history = [],
}: RunCommandParams): Promise<RunCommandResult> {
  const historyItems = formatHistory(history);

  // Tenant-scoped Corsair client shared by all tools
  const tenantCorsair = corsair.withTenant(tenantId);
  const toolCtx: ToolContext = { tenantId, tenantCorsair, conversationId };

  const customTools = buildTools(toolCtx);

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
      return {
        response:
          "I couldn't complete that in time — please try rephrasing or breaking it into smaller steps.",
      };
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

  // Query pending permissions for this tenant
  const pendingActions = await getPendingPermissions(tenantId);

  return {
    response: result.finalOutput ?? "",
    pendingActions: pendingActions.length > 0 ? pendingActions : undefined,
  };
}

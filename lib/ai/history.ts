import type { AgentInputItem } from "@openai/agents";
import type { ChatTurn } from "./types";

export const MAX_HISTORY = 8;
export const ASSISTANT_SNIPPET_LIMIT = 800;

export function formatHistory(history: ChatTurn[] = []): AgentInputItem[] {
  // Trim history to last 8 turns; cap long assistant messages
  const trimmedHistory = history.slice(-MAX_HISTORY).map((turn) =>
    turn.role === "assistant" && turn.content.length > ASSISTANT_SNIPPET_LIMIT
      ? { ...turn, content: turn.content.slice(0, ASSISTANT_SNIPPET_LIMIT) + "…" }
      : turn
  );

  return trimmedHistory.map((turn) =>
    turn.role === "user"
      ? { role: "user", content: turn.content }
      : {
          role: "assistant",
          status: "completed",
          content: [{ type: "output_text", text: turn.content }],
        }
  );
}

import type { TenantCorsair } from "@/lib/corsair";

export type { TenantCorsair };

export type ChatTurn = {
  role: "user" | "assistant";
  content: string;
};

export interface ToolContext {
  tenantId: string;
  tenantCorsair: TenantCorsair;
  conversationId?: string;
}

export interface PendingAction {
  id: string;
  type: string;
  [key: string]: unknown;
}

export interface PendingActionPreview {
  id: string;
  token: string;
  type: "send_email" | "create_calendar_event" | "delete_calendar_event" | "generic";
  plugin: string;
  endpoint: string;
  to?: string;
  subject?: string;
  body?: string;
  threadId?: string | null;
  eventId?: string;
  title?: string;
  startISO?: string;
  endISO?: string;
  description?: string | null;
  attendeeEmails?: string[];
  location?: string | null;
  addMeetLink?: boolean;
  expiresAt?: string;
}

export interface RunCommandParams {
  tenantId: string;
  conversationId?: string;
  message: string;
  history?: ChatTurn[];
}

export interface RunCommandResult {
  response: string;
  pendingActions?: PendingActionPreview[];
  tokensIn?: number;
  tokensOut?: number;
}

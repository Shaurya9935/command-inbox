export interface EmailResult {
  threadId?: string;
  from: string;
  to?: string;
  subject: string;
  date: string;
  snippet: string;
  unread: boolean;
}

export type {
  GmailHeader,
  GmailMessage,
  GmailMessagePart,
  ParsedBody,
  EnrichedThread,
  ThreadMessageItem,
} from "./server";

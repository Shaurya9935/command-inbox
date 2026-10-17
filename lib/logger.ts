/**
 * Safe structured logger that redacts sensitive PII and secrets,
 * truncates oversized values, and sanitizes error objects to prevent
 * accidental leakage of emails, tokens, or private user data into logs.
 */

const REDACT_KEYS = new Set([
  "body",
  "raw",
  "snippet",
  "content",
  "message",
  "subject",
  "to",
  "from",
  "description",
  "attendees",
  "access_token",
  "refresh_token",
  "authorization",
  "cookie",
  "password",
]);

const MAX_VALUE_LENGTH = 200;
const BASE64_PATTERN = /[A-Za-z0-9+/=]{40,}/g;

export interface SanitizedError {
  name: string;
  message: string;
  stack?: string;
}

export function sanitizeError(err: unknown): SanitizedError {
  if (err instanceof Error) {
    let cleanMsg = (err.message || "").replace(BASE64_PATTERN, "[BASE64_REDACTED]");
    if (cleanMsg.length > MAX_VALUE_LENGTH) {
      cleanMsg = cleanMsg.slice(0, MAX_VALUE_LENGTH) + "... [TRUNCATED]";
    }

    const shortStack = err.stack
      ? err.stack
          .split("\n")
          .slice(0, 3)
          .join("\n")
      : undefined;

    return {
      name: err.name || "Error",
      message: cleanMsg,
      stack: shortStack,
    };
  }

  const str = String(err).replace(BASE64_PATTERN, "[BASE64_REDACTED]");
  return {
    name: "UnknownError",
    message: str.length > MAX_VALUE_LENGTH ? str.slice(0, MAX_VALUE_LENGTH) + "..." : str,
  };
}

function sanitizeValue(key: string, val: unknown, depth = 0): unknown {
  if (depth > 5) return "[DEPTH_LIMIT]";
  if (val === null || val === undefined) return val;

  const lowerKey = key.toLowerCase();
  if (REDACT_KEYS.has(lowerKey)) {
    return "[REDACTED]";
  }

  if (val instanceof Error) {
    return sanitizeError(val);
  }

  if (typeof val === "string") {
    let clean = val.replace(BASE64_PATTERN, "[BASE64_REDACTED]");
    if (clean.length > MAX_VALUE_LENGTH) {
      clean = clean.slice(0, MAX_VALUE_LENGTH) + "... [TRUNCATED]";
    }
    return clean;
  }

  if (typeof val === "number" || typeof val === "boolean") {
    return val;
  }

  if (Array.isArray(val)) {
    return val.map((item, idx) => sanitizeValue(String(idx), item, depth + 1));
  }

  if (typeof val === "object") {
    const res: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      res[k] = sanitizeValue(k, v, depth + 1);
    }
    return res;
  }

  return String(val);
}

function formatOutput(
  level: "INFO" | "WARN" | "ERROR",
  msg: string,
  meta?: Record<string, unknown> | unknown
): string {
  const timestamp = new Date().toISOString();
  let cleanMsg = msg.replace(BASE64_PATTERN, "[BASE64_REDACTED]");
  if (cleanMsg.length > MAX_VALUE_LENGTH) {
    cleanMsg = cleanMsg.slice(0, MAX_VALUE_LENGTH) + "... [TRUNCATED]";
  }

  if (!meta) {
    return `[${timestamp}] [${level}] ${cleanMsg}`;
  }

  let sanitizedMeta: unknown;
  if (meta instanceof Error) {
    sanitizedMeta = sanitizeError(meta);
  } else if (typeof meta === "object") {
    sanitizedMeta = sanitizeValue("", meta, 0);
  } else {
    sanitizedMeta = sanitizeValue("", { value: meta }, 0);
  }

  return `[${timestamp}] [${level}] ${cleanMsg} ${JSON.stringify(sanitizedMeta)}`;
}

export const log = {
  info(message: string, meta?: Record<string, unknown> | unknown): void {
    console.info(formatOutput("INFO", message, meta));
  },

  warn(message: string, meta?: Record<string, unknown> | unknown): void {
    console.warn(formatOutput("WARN", message, meta));
  },

  error(message: string, meta?: Record<string, unknown> | unknown): void {
    console.error(formatOutput("ERROR", message, meta));
  },
};

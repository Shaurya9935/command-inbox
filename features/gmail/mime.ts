export function buildMimeMessage({
  to,
  subject,
  body,
  inReplyToMessageId,
}: {
  to: string;
  subject: string;
  body: string;
  inReplyToMessageId?: string | null;
}): string {
  const lines: string[] = [];
  lines.push(`To: ${to}`);
  lines.push(`Subject: ${subject}`);
  lines.push("MIME-Version: 1.0");
  lines.push('Content-Type: text/plain; charset="UTF-8"');
  lines.push("Content-Transfer-Encoding: 7bit");
  if (inReplyToMessageId) {
    const cleanId = inReplyToMessageId.trim();
    const formattedId =
      cleanId.startsWith("<") && cleanId.endsWith(">") ? cleanId : `<${cleanId}>`;
    lines.push(`In-Reply-To: ${formattedId}`);
    lines.push(`References: ${formattedId}`);
  }
  return `${lines.join("\r\n")}\r\n\r\n${body}`;
}

export function parseMimeRaw(rawBase64Url: string): {
  to?: string;
  subject?: string;
  body?: string;
} {
  try {
    const mimeStr = Buffer.from(rawBase64Url, "base64url").toString("utf-8");
    const parts = mimeStr.split(/\r?\n\r?\n/);
    const headerLines = parts[0]?.split(/\r?\n/) || [];
    const body = parts.slice(1).join("\n\n");

    const getHeader = (name: string): string | undefined => {
      const prefix = `${name.toLowerCase()}:`;
      const line = headerLines.find((l) => l.toLowerCase().startsWith(prefix));
      return line ? line.slice(prefix.length).trim() : undefined;
    };

    return {
      to: getHeader("to"),
      subject: getHeader("subject"),
      body: body.trim(),
    };
  } catch {
    return {};
  }
}

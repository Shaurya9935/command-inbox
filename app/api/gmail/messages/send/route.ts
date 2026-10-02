import { sendGmailMessage } from "@/features/gmail/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { threadId, to, subject, inReplyTo, references } = body;
    const messageBody = body.body || body.message;

    if (!messageBody || typeof messageBody !== "string" || !messageBody.trim()) {
      return NextResponse.json(
        { error: "Message body is required and cannot be empty" },
        { status: 400 }
      );
    }

    const result = await sendGmailMessage({
      threadId,
      to,
      subject,
      inReplyTo,
      references,
      body: messageBody,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[gmail/messages/send]", error);
    return NextResponse.json(
      { error: message || "Failed to send email message" },
      { status: 500 }
    );
  }
}

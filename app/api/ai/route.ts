import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { runCommand } from "@/lib/ai/agent";

export async function POST(request: Request) {
  try {
    // Get the logged-in user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const message = body.message;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const response = await runCommand({
      tenantId: session.user.id,
      message,
    });

    return NextResponse.json({
      response,
    });
  } catch (error) {
    console.error("AI route error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
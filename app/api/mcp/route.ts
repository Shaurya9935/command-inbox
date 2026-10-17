import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function GET() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });

  const authHeader = reqHeaders.get("authorization");
  const mcpSecret = process.env.MCP_SECRET || process.env.CORSAIR_DEV_API_KEY;
  const isSecretValid = Boolean(
    mcpSecret && authHeader && authHeader === `Bearer ${mcpSecret}`
  );

  if (!session?.user?.id && !isSecretValid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ status: "ok" });
}

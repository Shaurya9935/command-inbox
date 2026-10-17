import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { account } from "@/db/auth";
import { log } from "@/lib/logger";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userAccounts = await db
      .select({
        id: account.id,
        providerId: account.providerId,
        password: account.password,
      })
      .from(account)
      .where(eq(account.userId, session.user.id));

    const hasPassword = userAccounts.some(
      (a) => a.password !== null && a.password !== undefined
    );
    const providers = Array.from(new Set(userAccounts.map((a) => a.providerId)));

    return NextResponse.json({
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      },
      hasPassword,
      providers,
    });
  } catch (err) {
    log.error("[account/info] Error fetching account info", { error: err });
    return NextResponse.json({ error: "Failed to fetch account info" }, { status: 500 });
  }
}

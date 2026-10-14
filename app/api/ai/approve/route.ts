import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { executePermission } from "corsair";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { corsairPermissions } from "@/db/corsair";
import { corsair } from "@/lib/corsair";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { token, decision } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    if (decision !== "approve" && decision !== "deny" && decision !== "reject") {
      return NextResponse.json(
        { error: "Invalid decision. Must be 'approve' or 'deny'" },
        { status: 400 }
      );
    }

    // 1. Load row from corsair_permissions
    const [row] = await db
      .select()
      .from(corsairPermissions)
      .where(eq(corsairPermissions.token, token))
      .limit(1);

    if (!row) {
      return NextResponse.json({ error: "Permission record not found" }, { status: 404 });
    }

    // 2. Verify tenant_id matches the session user
    if (row.tenantId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden: permission tenant does not match user" },
        { status: 403 }
      );
    }

    // 3. Verify status is 'pending'
    if (row.status !== "pending") {
      return NextResponse.json(
        { error: `Permission is already ${row.status}` },
        { status: 400 }
      );
    }

    // 4. Handle Decision
    if (decision === "approve") {
      // Set status to approved
      await db
        .update(corsairPermissions)
        .set({ status: "approved", updatedAt: new Date() })
        .where(
          and(
            eq(corsairPermissions.token, token),
            eq(corsairPermissions.status, "pending")
          )
        );

      // Execute permission with Corsair
      const executionResult = await executePermission(corsair, token);

      return NextResponse.json({
        success: true,
        status: "approved",
        result: executionResult,
      });
    } else {
      // Set status to denied
      await db
        .update(corsairPermissions)
        .set({ status: "denied", updatedAt: new Date() })
        .where(
          and(
            eq(corsairPermissions.token, token),
            eq(corsairPermissions.status, "pending")
          )
        );

      return NextResponse.json({
        success: true,
        status: "denied",
      });
    }
  } catch (error) {
    console.error("[api/ai/approve] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process permission approval" },
      { status: 500 }
    );
  }
}

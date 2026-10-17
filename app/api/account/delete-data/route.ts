import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { verifyUserPassword, deleteUserData } from "@/lib/account/server";
import { log } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { password, confirmation } = body as {
      password?: string;
      confirmation?: string;
    };

    if (confirmation !== "DELETE") {
      return NextResponse.json(
        { error: 'Please type "DELETE" to confirm data deletion.' },
        { status: 400 }
      );
    }

    const verification = await verifyUserPassword(session.user.id, password);
    if (!verification.ok) {
      return NextResponse.json(
        { error: verification.error || "Authentication failed" },
        { status: 400 }
      );
    }

    const result = await deleteUserData(session.user.id);

    return NextResponse.json({
      success: true,
      message: "User data successfully deleted",
      deletedCounts: result.deletedCounts,
      revocations: result.revocations,
    });
  } catch (err) {
    log.error("[account/delete-data] Error deleting data", { error: err });
    return NextResponse.json({ error: "Failed to delete user data" }, { status: 500 });
  }
}

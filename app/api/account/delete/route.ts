import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { verifyUserPassword, deleteFullAccount } from "@/lib/account/server";

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
        { error: 'Please type "DELETE" to confirm account deletion.' },
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

    const result = await deleteFullAccount(session.user.id);

    const response = NextResponse.json({
      success: true,
      message: "Account and all associated data permanently deleted",
      deletedCounts: result.deletedCounts,
      revocations: result.revocations,
    });

    // Clear session cookies
    response.cookies.set("better-auth.session_token", "", { maxAge: 0, path: "/" });
    response.cookies.set("__Secure-better-auth.session_token", "", { maxAge: 0, path: "/" });

    return response;
  } catch (err) {
    console.error("[account/delete] Error deleting account:", err);
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

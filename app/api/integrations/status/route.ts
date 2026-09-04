import { auth } from "@/lib/auth";
import { corsair } from "@/lib/corsair";
import { headers } from "next/headers";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = session.user.id;
    let statuses: Record<string, string> = {};

    try {
      statuses = await corsair.manage.connectionStatus.get({ tenantId });
    } catch (e) {
      console.warn("Could not fetch connectionStatus from corsair:", e);
    }

    return Response.json({
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      },
      statuses: {
        gmail: statuses.gmail === "connected",
        googlecalendar: statuses.googlecalendar === "connected",
        outlook: false,
        slack: false,
        notion: false,
        ...statuses,
      },
      email: session.user.email,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: msg }, { status: 500 });
  }
}

import { auth } from "@/lib/auth";
import { corsair } from "@/lib/corsair";
import { getGmailAccountId } from "@/features/gmail/server";
import { getCalendarAccountId } from "@/features/calendar/server";
import { log } from "@/lib/logger";
import { headers } from "next/headers";

export async function GET() {
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
      log.warn("Could not fetch connectionStatus from corsair", { error: e });
    }

    const booleanStatuses: Record<string, boolean> = Object.fromEntries(
      Object.entries(statuses).map(([plugin, status]) => [
        plugin,
        status === "connected",
      ])
    );

    const gmailAccountId = await getGmailAccountId(tenantId);
    const calendarAccountId = await getCalendarAccountId(tenantId);

    return Response.json({
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      },
      statuses: {
        ...booleanStatuses,
        gmail: Boolean(booleanStatuses.gmail || gmailAccountId),
        googlecalendar: Boolean(booleanStatuses.googlecalendar || calendarAccountId),
      },
      email: session.user.email,
    });
  } catch (err) {
    log.error("[integrations/status] Error fetching status", { error: err });
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}

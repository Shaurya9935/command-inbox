import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { corsairAccounts, corsairIntegrations, corsairEntities, corsairEvents } from "@/db/corsair";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const plugin = body?.plugin;

    if (!plugin) {
      return Response.json({ error: "Plugin name is required" }, { status: 400 });
    }

    // Map common names to corsair plugin names
    const pluginName = plugin === "calendar" ? "googlecalendar" : plugin;

    // Find integration row
    const integrations = await db
      .select()
      .from(corsairIntegrations)
      .where(eq(corsairIntegrations.name, pluginName));

    if (integrations.length > 0) {
      const integrationId = integrations[0].id;
      const accounts = await db
        .select()
        .from(corsairAccounts)
        .where(
          and(
            eq(corsairAccounts.tenantId, session.user.id),
            eq(corsairAccounts.integrationId, integrationId)
          )
        );

      for (const acc of accounts) {
        // Clean up entities and events associated with this account
        try {
          await db.delete(corsairEntities).where(eq(corsairEntities.accountId, acc.id));
        } catch {}
        try {
          await db.delete(corsairEvents).where(eq(corsairEvents.accountId, acc.id));
        } catch {}
        await db.delete(corsairAccounts).where(eq(corsairAccounts.id, acc.id));
      }
    }

    return Response.json({ success: true, plugin: pluginName });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return Response.json({ error: msg }, { status: 500 });
  }
}

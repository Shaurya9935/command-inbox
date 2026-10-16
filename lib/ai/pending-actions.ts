import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { corsairPermissions, corsairEntities } from "@/db/corsair";
import { parseMimeRaw } from "@/features/gmail/mime";
import type { PendingAction, PendingActionPreview } from "./types";

// In-memory pending actions store kept for backward compatibility
export const pendingActionsStore = new Map<string, PendingAction>();

export async function getPendingPermissions(tenantId: string): Promise<PendingActionPreview[]> {
  try {
    const rows = await db
      .select()
      .from(corsairPermissions)
      .where(and(eq(corsairPermissions.tenantId, tenantId), eq(corsairPermissions.status, "pending")))
      .orderBy(desc(corsairPermissions.createdAt));

    const actions: PendingActionPreview[] = [];

    for (const row of rows) {
      try {
        const parsedArgs = JSON.parse(row.args || "{}");

        if (row.plugin === "gmail" && row.endpoint === "messages.send") {
          const mime = parseMimeRaw(parsedArgs.raw || "");
          actions.push({
            id: row.id,
            token: row.token,
            type: "send_email",
            plugin: row.plugin,
            endpoint: row.endpoint,
            to: mime.to || parsedArgs.to || "Unknown",
            subject: mime.subject || parsedArgs.subject || "",
            body: mime.body || parsedArgs.body || "",
            threadId: parsedArgs.threadId ?? null,
            expiresAt: row.expiresAt,
          });
        } else if (row.plugin === "googlecalendar" && row.endpoint === "events.create") {
          const ev = parsedArgs.event || {};
          actions.push({
            id: row.id,
            token: row.token,
            type: "create_calendar_event",
            plugin: row.plugin,
            endpoint: row.endpoint,
            title: ev.summary || "No Title",
            startISO: ev.start?.dateTime || ev.start?.date || "",
            endISO: ev.end?.dateTime || ev.end?.date || "",
            description: ev.description ?? null,
            location: ev.location ?? null,
            attendeeEmails:
              ev.attendees?.map((a: { email?: string }) => a.email).filter(Boolean) ?? [],
            addMeetLink: !!ev.conferenceData || parsedArgs.conferenceDataVersion === 1,
            expiresAt: row.expiresAt,
          });
        } else if (row.plugin === "googlecalendar" && row.endpoint === "events.delete") {
          const eventId = parsedArgs.id || "";
          let eventTitle = "Calendar Event";
          let startISO = "";
          let endISO = "";

          if (eventId) {
            try {
              const entityRows = await db
                .select({ data: corsairEntities.data })
                .from(corsairEntities)
                .where(
                  and(
                    eq(corsairEntities.entityType, "events"),
                    eq(corsairEntities.entityId, eventId)
                  )
                )
                .limit(1);

              if (entityRows[0]?.data) {
                const d = entityRows[0].data as {
                  summary?: string;
                  start?: { dateTime?: string; date?: string };
                  end?: { dateTime?: string; date?: string };
                };
                if (d.summary) eventTitle = d.summary;
                startISO = d.start?.dateTime || d.start?.date || "";
                endISO = d.end?.dateTime || d.end?.date || "";
              }
            } catch (err) {
              console.warn("Failed to lookup event details for delete preview:", err);
            }
          }

          actions.push({
            id: row.id,
            token: row.token,
            type: "delete_calendar_event",
            plugin: row.plugin,
            endpoint: row.endpoint,
            eventId,
            title: eventTitle,
            startISO,
            endISO,
            expiresAt: row.expiresAt,
          });
        } else {
          // Generic / other gated action
          actions.push({
            id: row.id,
            token: row.token,
            type: "generic",
            plugin: row.plugin,
            endpoint: row.endpoint,
            title: `${row.plugin}: ${row.endpoint}`,
            expiresAt: row.expiresAt,
          });
        }
      } catch (err) {
        console.warn("Failed to parse permission row args:", err);
      }
    }

    return actions;
  } catch (error) {
    console.error("Failed to query pending permissions:", error);
    return [];
  }
}

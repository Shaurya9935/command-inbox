import { getCorsairTenant } from "@/lib/corsair-client";

export interface EnrichedCalendarEvent {
  id: string;
  entity_id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    date?: string;
    dateTime?: string;
    timeZone?: string;
  };
  end: {
    date?: string;
    dateTime?: string;
    timeZone?: string;
  };
  status?: "tentative" | "confirmed" | "cancelled";
  htmlLink?: string;
  hangoutLink?: string;
  creator?: { email?: string; displayName?: string };
  organizer?: { email?: string; displayName?: string };
  attendees?: Array<{ email?: string; displayName?: string; responseStatus?: string }>;
  created?: string;
  updated?: string;
  createdAt: string;
}

/**
 * Read calendar events from the local Corsair DB — fast, no rate limits.
 * Returns cached events stored in the database.
 */
export async function getCalendarEvents(): Promise<EnrichedCalendarEvent[]> {
  const corsair = await getCorsairTenant();

  try {
    const entities = await corsair.googlecalendar.db.events.list({ limit: 50 });
    if (Array.isArray(entities) && entities.length > 0) {
      return entities.map((e) => {
        const d = e.data;
        const ts =
          d?.createdAt instanceof Date
            ? d.createdAt.toISOString()
            : typeof d?.createdAt === "string"
            ? d.createdAt
            : d?.created || new Date().toISOString();

        return {
          id: e.entity_id || d?.id || "",
          entity_id: e.entity_id || d?.id || "",
          summary: d?.summary || "No Title",
          description: d?.description,
          location: d?.location,
          start: {
            date: d?.start?.date,
            dateTime: d?.start?.dateTime,
            timeZone: d?.start?.timeZone,
          },
          end: {
            date: d?.end?.date,
            dateTime: d?.end?.dateTime,
            timeZone: d?.end?.timeZone,
          },
          status: d?.status,
          htmlLink: d?.htmlLink,
          hangoutLink: d?.hangoutLink,
          creator: d?.creator
            ? { email: d.creator.email, displayName: d.creator.displayName }
            : undefined,
          organizer: d?.organizer
            ? { email: d.organizer.email, displayName: d.organizer.displayName }
            : undefined,
          attendees: d?.attendees?.map((a) => ({
            email: a.email,
            displayName: a.displayName,
            responseStatus: a.responseStatus,
          })),
          created: d?.created,
          updated: d?.updated,
          createdAt: ts,
        };
      });
    }
  } catch (err) {
    console.warn("DB calendar events fetch failed:", err);
  }

  return [];
}

/**
 * Pull fresh events from the Google Calendar API,
 * upsert into Corsair DB cache, and return the events list.
 */
export async function syncCalendarEventsFromApi(): Promise<EnrichedCalendarEvent[]> {
  const corsair = await getCorsairTenant();

  // Fetch events from 7 days ago to upcoming 30 days
  const timeMin = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const timeMax = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const res = await corsair.googlecalendar.api.events.getMany({
    calendarId: "primary",
    maxResults: 50,
    singleEvents: true,
    orderBy: "startTime",
    timeMin,
    timeMax,
  });

  const rawEvents = res?.items ?? [];

  if (!rawEvents.length) {
    return [];
  }

  const events: EnrichedCalendarEvent[] = [];

  await Promise.allSettled(
    rawEvents.map(async (ev) => {
      if (!ev.id) return;

      const nowIso = new Date().toISOString();
      const createdIso = ev.created || nowIso;

      // Upsert into local database cache
      try {
        await corsair.googlecalendar.db.events.upsertByEntityId(ev.id, {
          id: ev.id,
          summary: ev.summary || undefined,
          description: ev.description || undefined,
          location: ev.location || undefined,
          status: ev.status as "tentative" | "confirmed" | "cancelled" | undefined,
          htmlLink: ev.htmlLink || undefined,
          hangoutLink: ev.hangoutLink || undefined,
          start: ev.start
            ? {
                date: ev.start.date || undefined,
                dateTime: ev.start.dateTime || undefined,
                timeZone: ev.start.timeZone || undefined,
              }
            : undefined,
          end: ev.end
            ? {
                date: ev.end.date || undefined,
                dateTime: ev.end.dateTime || undefined,
                timeZone: ev.end.timeZone || undefined,
              }
            : undefined,
          creator: ev.creator
            ? {
                id: ev.creator.id || undefined,
                email: ev.creator.email || undefined,
                displayName: ev.creator.displayName || undefined,
                self: ev.creator.self || undefined,
              }
            : undefined,
          organizer: ev.organizer
            ? {
                id: ev.organizer.id || undefined,
                email: ev.organizer.email || undefined,
                displayName: ev.organizer.displayName || undefined,
                self: ev.organizer.self || undefined,
              }
            : undefined,
          attendees: ev.attendees
            ? ev.attendees.map((a) => ({
                id: a.id || undefined,
                email: a.email || undefined,
                displayName: a.displayName || undefined,
                organizer: a.organizer || undefined,
                self: a.self || undefined,
                resource: a.resource || undefined,
                optional: a.optional || undefined,
                responseStatus: a.responseStatus as
                  | "needsAction"
                  | "declined"
                  | "tentative"
                  | "accepted"
                  | undefined,
                comment: a.comment || undefined,
                additionalGuests: a.additionalGuests || undefined,
              }))
            : undefined,
          created: ev.created || undefined,
          updated: ev.updated || undefined,
          createdAt: new Date(createdIso),
        });
      } catch (e) {
        console.warn(`Failed to upsert calendar event ${ev.id}:`, e);
      }

      events.push({
        id: ev.id,
        entity_id: ev.id,
        summary: ev.summary || "No Title",
        description: ev.description || undefined,
        location: ev.location || undefined,
        start: {
          date: ev.start?.date || undefined,
          dateTime: ev.start?.dateTime || undefined,
          timeZone: ev.start?.timeZone || undefined,
        },
        end: {
          date: ev.end?.date || undefined,
          dateTime: ev.end?.dateTime || undefined,
          timeZone: ev.end?.timeZone || undefined,
        },
        status: ev.status as "tentative" | "confirmed" | "cancelled" | undefined,
        htmlLink: ev.htmlLink || undefined,
        hangoutLink: ev.hangoutLink || undefined,
        creator: ev.creator
          ? { email: ev.creator.email || undefined, displayName: ev.creator.displayName || undefined }
          : undefined,
        organizer: ev.organizer
          ? { email: ev.organizer.email || undefined, displayName: ev.organizer.displayName || undefined }
          : undefined,
        attendees: ev.attendees?.map((a) => ({
          email: a.email || undefined,
          displayName: a.displayName || undefined,
          responseStatus: a.responseStatus || undefined,
        })),
        created: ev.created || undefined,
        updated: ev.updated || undefined,
        createdAt: createdIso,
      });
    })
  );

  // Sort events by start time
  return events.sort((a, b) => {
    const timeA = new Date(a.start.dateTime || a.start.date || 0).getTime();
    const timeB = new Date(b.start.dateTime || b.start.date || 0).getTime();
    return timeA - timeB;
  });
}

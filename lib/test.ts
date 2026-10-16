import "dotenv/config";
import { executePermission } from "corsair";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { corsair } from "@/lib/corsair";
import { corsairPermissions, corsairEntities } from "@/db/corsair";
import {
  getEventsInRange,
  createCalendarEventWithMeet,
  deleteCalendarEvent,
} from "@/features/calendar/server";

async function approveLatestPermission(tenantId: string, endpoint: string): Promise<unknown> {
  const [row] = await db
    .select()
    .from(corsairPermissions)
    .where(
      and(
        eq(corsairPermissions.tenantId, tenantId),
        eq(corsairPermissions.status, "pending"),
        eq(corsairPermissions.endpoint, endpoint)
      )
    )
    .orderBy(desc(corsairPermissions.createdAt))
    .limit(1);

  if (!row) {
    throw new Error(`No pending permission found for endpoint: ${endpoint}`);
  }

  console.log(`Approving permission token for ${endpoint}: ${row.token.slice(0, 16)}...`);
  await db
    .update(corsairPermissions)
    .set({ status: "approved", updatedAt: new Date() })
    .where(eq(corsairPermissions.id, row.id));

  const result = await executePermission(corsair, row.token);
  return result;
}

async function main() {
  const tenantId = "Xr8vQdWuC1vYWdoh8RHmqNr445IZimsR";
  const tenantCorsair = corsair.withTenant(tenantId);

  console.log("=== STEP 1: Initiating Event Creation ===");
  const testTitle = `Test Event ${Date.now()}`;
  const startISO = "2026-10-20T10:00:00+05:30";
  const endISO = "2026-10-20T11:00:00+05:30";

  let createdId: string | null = null;
  try {
    const res = await createCalendarEventWithMeet({
      tenantCorsair,
      title: testTitle,
      startISO,
      endISO,
      description: "Temporary event for deletion test",
      location: "Online",
      addMeetLink: false,
    });
    console.log("Direct create result:", res);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("waiting for the user's approval") || msg.includes("approval")) {
      console.log("Creation required user approval. Executing approval...");
      const execResult = (await approveLatestPermission(tenantId, "events.create")) as {
        result?: { id?: string };
      };
      console.log("Approval execution result:", execResult);
      createdId = execResult?.result?.id || null;
    } else {
      throw err;
    }
  }

  console.log("\n=== STEP 2: Verifying Event Retrieval & ID Presence ===");
  const events = await getEventsInRange({
    tenantId,
    tenantCorsair,
    startISO: "2026-10-20T00:00:00+05:30",
    endISO: "2026-10-20T23:59:59+05:30",
  });

  console.log(`Found ${events.length} event(s) in range.`);
  const createdEvent = events.find((e) => e.title === testTitle || (createdId && e.id === createdId));
  if (!createdEvent) {
    throw new Error(`Event "${testTitle}" not found after creation!`);
  }
  console.log(`Found created event: "${createdEvent.title}" with ID: "${createdEvent.id}"`);
  if (!createdEvent.id) {
    throw new Error("Created event has no ID in getEventsInRange!");
  }

  const targetEventId = createdEvent.id;

  console.log("\n=== STEP 3: Initiating Event Deletion ===");
  try {
    const res = await deleteCalendarEvent({
      tenantCorsair,
      eventId: targetEventId,
      tenantId,
    });
    console.log("Direct delete result:", res);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("waiting for the user's approval") || msg.includes("approval")) {
      console.log("Deletion required user approval. Executing approval...");
      const execResult = await approveLatestPermission(tenantId, "events.delete");
      console.log("Deletion approval execution result:", execResult);

      // Clean up cache as approve route does
      await db
        .delete(corsairEntities)
        .where(
          and(
            eq(corsairEntities.entityType, "events"),
            eq(corsairEntities.entityId, targetEventId)
          )
        );
    } else {
      throw err;
    }
  }

  console.log("\n=== STEP 4: Verifying Event Is Permanently Deleted ===");
  const eventsAfter = await getEventsInRange({
    tenantId,
    tenantCorsair,
    startISO: "2026-10-20T00:00:00+05:30",
    endISO: "2026-10-20T23:59:59+05:30",
  });

  const stillExists = eventsAfter.find((e) => e.id === targetEventId);
  if (stillExists) {
    throw new Error(`Event ${targetEventId} still exists after deletion!`);
  }

  console.log(`\n🎉 SUCCESS! Event "${testTitle}" was created, verified with ID, and successfully deleted!`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});

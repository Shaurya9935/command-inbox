# Decision Record: Resolving Calendar Event Deletion in AI Agent

## 1. Problem Statement
When a user asks the AI chatbot to delete a calendar event, the bot creates a new event instead of deleting the requested event.

---

## 2. Root Cause Analysis

A thorough code audit of `lib/ai/`, `features/calendar/`, and `components/dashboard/` revealed multiple compounding issues:

1. **No `delete_calendar_event` AI Tool Existed**:
   In `features/calendar/ai-tools.ts`, only two tools were defined: `get_calendar_events` and `create_calendar_event`. There was no deletion tool registered in the tool array.

2. **System Prompt Instruction Trap**:
   In `lib/ai/instructions.ts`, the instructions explicitly commanded:
   ```text
   WRITES — use deterministic tools:
   - For writes use send_email and create_calendar_event only.
   ```
   When instructed to delete an event, the LLM lacked a delete tool and followed the strict prompt instruction to use `create_calendar_event`, leading it to create an event (often titled or tagged with "cancel" or duplicated).

3. **Event IDs Were Stripped From Read Outputs**:
   `CalendarEventResult` in `features/calendar/types.ts` only included:
   ```ts
   export interface CalendarEventResult {
     title: string;
     start: string;
     end: string;
     location: string | null;
     meetLink: string | null;
   }
   ```
   Even if the model inspected events with `get_calendar_events`, the unique `id` was omitted. The model literally had no event ID to target for modification or deletion.

4. **Missing Service Layer Deletion Implementation**:
   `features/calendar/server.ts` had no `deleteCalendarEvent` service function to invoke Corsair's `tenantCorsair.googlecalendar.api.events.delete` and invalidate the local PostgreSQL `corsair_entities` cache.

5. **Incomplete Confirmation Guard & Approval Pipeline**:
   - `lib/corsair.ts` did not explicitly override `"events.delete": "require_approval"`.
   - `lib/ai/pending-actions.ts` did not map `googlecalendar:events.delete` permissions into a typed `delete_calendar_event` preview.
   - `components/dashboard/default-workspace.tsx` did not render a confirmation card for event deletions.
   - `app/api/ai/approve/route.ts` did not invalidate the local event cache after an approved deletion was executed.

---

## 3. Architecture & Decision Plan

In strict accordance with the repository's layering rules (`AGENTS.md`):

### 3.1. Data & Types (`features/calendar/types.ts`)
- Include `id: string` in `CalendarEventResult`.
- Ensure `getEventsInRange` in `features/calendar/server.ts` returns the event ID both from the local cache (`row.entityId || d.id`) and from the live API fallback (`ev.id`).

### 3.2. Service Layer (`features/calendar/server.ts`)
- Implement `deleteCalendarEvent({ tenantCorsair, eventId, tenantId })`:
  1. Call `tenantCorsair.googlecalendar.api.events.delete({ calendarId: "primary", id: eventId })`.
  2. Invalidate local PostgreSQL cache in `corsair_entities` by removing the row or setting status to `cancelled`.
  3. Export `getCalendarAccountId(tenantId)` helper for clean multi-tenant DB queries.

### 3.3. AI Tool Definition (`features/calendar/ai-tools.ts`)
- Implement `delete_calendar_event` via `strictTool`:
  - Parameter schema: `eventId` (string), optional `title` (string).
  - Resilient resolution: if `eventId` is directly provided, use it; if `title` is provided, find matching event in upcoming range and resolve `id`.
  - Handle Corsair `PermissionRequiredError` gracefully by returning `{ status: "waiting_approval", message: msg }`.

### 3.4. Prompt Instructions (`lib/ai/instructions.ts`)
- Update `WRITES` section to include `delete_calendar_event`.
- Add an explicit rule:
  - *To delete a calendar event: first call `get_calendar_events` to locate the event and its `id`, then call `delete_calendar_event` with the `eventId`.*
  - *NEVER call `create_calendar_event` when the user asks to delete or cancel an event.*

### 3.5. Security & Confirmation Guards
- **`lib/corsair.ts`**: Add `"events.delete": "require_approval"` to `googlecalendar` overrides.
- **`lib/ai/types.ts` & `lib/ai/pending-actions.ts`**: Add `delete_calendar_event` to `PendingActionPreview` and extract event title, time, and `eventId` from the permission args and DB cache.
- **`components/dashboard/default-workspace.tsx`**: Render dedicated confirmation card with red warning accent for deletion actions with Approve/Deny buttons.
- **`app/api/ai/approve/route.ts`**: Remove the deleted event from `corsair_entities` upon approval execution.

### 3.6. REST API Consistency (`app/api/calendar/events/route.ts`)
- Add `DELETE` route accepting `eventId` to allow direct programmatic and UI deletion.

---

## 4. Verification Strategy
1. Run automated TypeScript check (`pnpm tsc --noEmit`) and linter (`pnpm lint`).
2. Run end-to-end programmatic verification script:
   - Create a test calendar event via service layer.
   - Verify event exists in calendar.
   - Delete the event using `deleteCalendarEvent`.
   - Verify the event is removed from Google Calendar and the local database cache.

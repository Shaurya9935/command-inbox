# Command Inbox

> **One command center for your digital life.**

Command Inbox is an AI-powered productivity workspace designed to bring services like **Gmail** and **Google Calendar** into one place. Instead of jumping between different apps to find information or complete simple tasks, the goal is to give users a single interface where they can **see, search, and act on their connected services through natural language**.

---

## 🚀 What is Command Inbox?

Modern productivity is fragmented.

Your emails live in Gmail.  
Your meetings live in Google Calendar.  
Important information is scattered across conversations, notifications, and different applications.

**Command Inbox** is being built to solve that fragmentation.

The core idea is simple:

> **Tell Command Inbox what you need, and let it figure out where the information lives and what needs to be done.**

For example:

```text
"What meetings do I have tomorrow?"

"Show me my recent emails."

"Did I receive anything important today?"

"What is my schedule for this afternoon?"
```

The long-term vision is to turn Command Inbox into a **personal command layer over the user's digital workspace**.

---

# ✨ Current Features

## 📥 Unified Inbox

Command Inbox currently connects to the user's email service and brings emails into its own interface.

Users can view their emails without having to leave the Command Inbox workspace.

The inbox/dashboard is intended to become the central place for information coming from multiple connected services.

---

## 📧 Gmail Integration

Gmail integration is currently implemented through **Corsair**.

The current setup allows a user to authenticate and connect their Gmail account, after which email data can be retrieved and displayed inside Command Inbox.

### Current flow

```text
User
  ↓
Command Inbox
  ↓
Corsair
  ↓
Gmail OAuth
  ↓
Connected Gmail Account
  ↓
Email Data
  ↓
Command Inbox Inbox / Dashboard
```

The OAuth setup currently uses **manual OAuth authentication**, which resolved the previous connection/authentication issues encountered during development.

---

## 📅 Google Calendar Integration

Google Calendar is fully integrated into the connected-services architecture, bringing scheduling directly into Command Inbox alongside email data.

The integration currently supports:
- **Multi-View Workspace**: Comprehensive views for **Day**, **Week** (with hourly grid & live time indicator), **Month**, and **Agenda** formats.
- **Event Synchronization**: Live synchronization from the Google Calendar API (-7 to +30 days window) with local PostgreSQL caching for zero-latency page loads.
- **Rich Event Popovers**: View start/end times, descriptions, locations, Google Meet direct join links, and attendee RSVP statuses.
- **Right Context Widget**: A persistent sidebar widget showing today's schedule and dynamic countdowns to your next meeting.

---

## 🔗 Connect Apps & Mailboxes Hub

Command Inbox features a dedicated integration hub (`/dashboard/connect`) designed to manage all linked productivity accounts:
- **OAuth Connections**: Direct connection management for **Gmail** and **Google Calendar** via Corsair.
- **Extensible Directory**: UI integrations and simulated connectors for **Microsoft Outlook**, **Slack**, **Notion**, **Zoom**, **Linear**, and **GitHub**.
- **Lifecycle Management**: Real-time connection status polling, interactive connection setup modals, and clean disconnect/re-auth workflows.

---

# 🤖 AI Assistant

Command Inbox includes an AI assistant designed to act as the user's natural-language interface to their connected services.

Instead of forcing the user to navigate through multiple screens, the assistant should understand intent and use the appropriate connected service to retrieve the required information.

Conceptually:

```text
User Request
     ↓
AI Assistant
     ↓
Understand Intent
     ↓
Choose Relevant Service
     ↓
Call Connected Service
     ↓
Process Result
     ↓
Return Useful Answer
```

For example:

```text
User:
"What emails did I get today?"

        ↓

AI understands:
Service = Gmail
Task = Retrieve today's emails

        ↓

Gmail via Corsair

        ↓

AI summarizes / presents results
```

The assistant is being designed around **actions and information retrieval**, rather than simply being a generic chatbot.

---

# 🔌 Corsair Integration

Command Inbox uses **Corsair** as the connection layer between the application and external services.

This provides a cleaner architecture where Command Inbox does not need to implement every third-party integration completely from scratch.

Current integrations being worked with include:

- Gmail
- Google Calendar
- GitHub

The architecture is intended to make additional integrations easier to add later.

Conceptually:

```text
                  ┌───────────────┐
                  │ Command Inbox │
                  └───────┬───────┘
                          │
                       Corsair
                          │
          ┌───────────────┼───────────────┐
          ↓               ↓               ↓
       Gmail          Calendar         GitHub
```

---

# 🔐 Authentication

Command Inbox uses **Better Auth** for application authentication.

This keeps user authentication separate from third-party service authentication.

There are therefore two distinct concepts:

### Application Authentication

```text
User
 ↓
Better Auth
 ↓
Command Inbox Account
```

### Connected Service Authentication

```text
Command Inbox
 ↓
Corsair
 ↓
OAuth
 ↓
Gmail / Calendar / Other Service
```

Keeping these responsibilities separate makes the architecture easier to reason about and extend.

---

# 🏗️ Architecture

The project currently follows a modular architecture built around:

```text
Frontend
   │
   ├── Dashboard
   ├── Inbox
   └── AI Assistant
          │
          ↓
       Backend
          │
          ├── Authentication
          │      └── Better Auth
          │
          └── Integrations
                 └── Corsair
                       ├── Gmail
                       ├── Calendar
                       └── GitHub
```

The exact architecture will continue to evolve as more actions and integrations are added.

---

# 🛠️ Tech Stack

The project is currently being developed using modern web technologies.

### Core

- **TypeScript**
- **React / Next.js**
- **Node.js**
- **PostgreSQL**
- **Drizzle ORM**

### Authentication

- **Better Auth**

### Integrations

- **Corsair**
- Gmail
- Google Calendar
- GitHub

### Development

- **pnpm**
- **Docker** for local infrastructure where required

---

# 📌 Current Project Status

Command Inbox has transitioned from an early prototype into a **functioning multi-service productivity workstation** with live OAuth integrations, real-time data sync, database caching, an AI command layer, and modern multi-view interfaces.

---

# ✅ Completed Tasks

The following core systems and capabilities have been fully implemented in the codebase:

### 1. 🔐 Authentication & Session Management
- [x] **Better Auth Integration**: Multi-provider application authentication configured with Drizzle ORM PostgreSQL adapter ([`lib/auth.ts`](file:///Users/shauryagupta/Dev/Projects/command-inbox/lib/auth.ts), [`db/auth.ts`](file:///Users/shauryagupta/Dev/Projects/command-inbox/db/auth.ts)).
- [x] **Authentication Pages**: Full authentication suite with clean, accessible UI for Login ([`app/(auth)/login/page.tsx`](file:///Users/shauryagupta/Dev/Projects/command-inbox/app/(auth)/login/page.tsx)) and Registration ([`app/(auth)/register/page.tsx`](file:///Users/shauryagupta/Dev/Projects/command-inbox/app/(auth)/register/page.tsx)).
- [x] **Next.js 16 Request Proxy**: Edge-compatible optimistic session check and route protection in [`proxy.ts`](file:///Users/shauryagupta/Dev/Projects/command-inbox/proxy.ts).

### 2. 🔌 Corsair & Third-Party OAuth Infrastructure
- [x] **Corsair Multi-Tenancy Architecture**: Per-user isolated Corsair instances via [`getCorsairTenant`](file:///Users/shauryagupta/Dev/Projects/command-inbox/lib/corsair-client.ts#L5) in [`lib/corsair-client.ts`](file:///Users/shauryagupta/Dev/Projects/command-inbox/lib/corsair-client.ts).
- [x] **Manual (Hub-less) OAuth Flow**: Built-in OAuth state resolution ([`app/(auth)/connect/page.tsx`](file:///Users/shauryagupta/Dev/Projects/command-inbox/app/(auth)/connect/page.tsx)) and OAuth callback handler ([`app/api/oauth/callback/route.ts`](file:///Users/shauryagupta/Dev/Projects/command-inbox/app/api/oauth/callback/route.ts)) redirecting to dashboard with connection query tags.
- [x] **App Integration Directory**: Full Connect Apps workspace ([`app/dashboard/connect/page.tsx`](file:///Users/shauryagupta/Dev/Projects/command-inbox/app/dashboard/connect/page.tsx)) with category filtering, search, live status polling, connection modals, and disconnect handlers.
- [x] **Webhook & MCP Endpoints**: Handlers in [`app/api/webhooks/route.ts`](file:///Users/shauryagupta/Dev/Projects/command-inbox/app/api/webhooks/route.ts) and [`app/api/mcp/route.ts`](file:///Users/shauryagupta/Dev/Projects/command-inbox/app/api/mcp/route.ts).

### 3. 📥 Gmail & Inbox System
- [x] **Gmail API Integration**: Real-time thread retrieval via `@corsair-dev/gmail`.
- [x] **PostgreSQL Entity Caching**: Local caching in `corsair_entities` table to avoid API rate limits ([`getInboxThreadsFromDb`](file:///Users/shauryagupta/Dev/Projects/command-inbox/features/gmail/server.ts#L152)).
- [x] **Incremental Smart Sync**: Background sync with `historyId` validation, 15-minute sync throttling, and batched message detail enrichment ([`syncInboxThreadsFromApi`](file:///Users/shauryagupta/Dev/Projects/command-inbox/features/gmail/server.ts#L536)).
- [x] **Full Thread & MIME Parser**: Recursive body parser supporting HTML, plain text, headers, and sender extraction ([`parseMessagePart`](file:///Users/shauryagupta/Dev/Projects/command-inbox/features/gmail/server.ts#L96)).
- [x] **Dedicated Inbox Interface**: Dual-pane workspace with search, folder filtering (Inbox, Starred, Drafts, Sent, Spam, Trash), unread badge counts, star toggling, and sanitized HTML email preview ([`app/dashboard/inbox/page.tsx`](file:///Users/shauryagupta/Dev/Projects/command-inbox/app/dashboard/inbox/page.tsx)).

### 4. 📅 Google Calendar System
- [x] **Google Calendar Integration**: Live event syncing via `@corsair-dev/googlecalendar` across a 37-day window (-7 to +30 days) with local DB upserting ([`features/calendar/server.ts`](file:///Users/shauryagupta/Dev/Projects/command-inbox/features/calendar/server.ts)).
- [x] **Multi-View Calendar Workspace**: Dedicated calendar app ([`app/dashboard/calendar/page.tsx`](file:///Users/shauryagupta/Dev/Projects/command-inbox/app/dashboard/calendar/page.tsx)) featuring:
  - **Week View**: 7-day hourly grid with current-time red indicator line and event block positioning.
  - **Day View**: Focused single-day schedule with full attendee and conference details.
  - **Month View**: Complete monthly grid with multi-day event overflow markers.
  - **Agenda View**: Chronological event list grouped by date.
- [x] **Interactive Event Popover**: Detailed popover with start/end times, location, Google Meet direct join button, and attendee RSVP statuses.
- [x] **Today's Schedule & Countdown Widget**: Right-hand contextual panel on dashboard and calendar pages displaying upcoming events and dynamic countdown (`until Team sync`).

### 5. 🤖 AI Assistant & Natural Language Command Center
- [x] **OpenAI Agents SDK Integration**: Agent runner utilizing `@corsair-dev/mcp` provider and wrapped with strict schema enforcement ([`runCommand`](file:///Users/shauryagupta/Dev/Projects/command-inbox/lib/ai/agent.ts#L23)).
- [x] **Multi-Turn Persistent Chat**: Database persistence for conversations and chat history with cascade deletion ([`conversations`](file:///Users/shauryagupta/Dev/Projects/command-inbox/db/conversation.ts#L11) and [`chatMessages`](file:///Users/shauryagupta/Dev/Projects/command-inbox/db/conversation.ts#L46)).
- [x] **Conversations API**: Full CRUD endpoints for listing, creating, retrieving, clearing, and deleting conversations ([`app/api/conversations/route.ts`](file:///Users/shauryagupta/Dev/Projects/command-inbox/app/api/conversations/route.ts)).
- [x] **Command Surface UI**: Global `⌘K` command input ([`CommandSurface`](file:///Users/shauryagupta/Dev/Projects/command-inbox/components/dashboard/command-surface.tsx)), prompt suggestions ([`Suggestions`](file:///Users/shauryagupta/Dev/Projects/command-inbox/components/dashboard/suggestions.tsx)), rich markdown response rendering, and dynamic contextual action buttons.

---

# 🐛 Bugs & Required Fixes (Active To-Do)

The following bugs and required fixes have been identified across the codebase and are actively tracked:

### 🔴 Critical & High Priority Fixes

- [x] **Fix Integration Status Boolean Overwrite in API Route**
  - **Location**: [`app/api/integrations/status/route.ts#L31-L38`](file:///Users/shauryagupta/Dev/Projects/command-inbox/app/api/integrations/status/route.ts#L31-L38)
  - **Problem**: The route constructs `statuses: { gmail: statuses.gmail === "connected", ..., ...statuses }`. Spreading raw `...statuses` at the end overwrites the boolean flags with strings like `"connected"` or `"disconnected"`. On the client ([`connect-workspace.tsx`](file:///Users/shauryagupta/Dev/Projects/command-inbox/components/connect/connect-workspace.tsx#L92)), `Boolean(statuses.gmail)` checks `Boolean("disconnected")`, which evaluates to `true` (non-empty string). Disconnected integrations are falsely shown as connected.
  - **Fix**: Return clean booleans without spreading raw status strings.

- [ ] **Replace Boilerplate Home Page (`app/page.tsx`) with Landing or Smart Redirect**
  - **Location**: [`app/page.tsx`](file:///Users/shauryagupta/Dev/Projects/command-inbox/app/page.tsx)
  - **Problem**: Visiting `/` currently loads the default Next.js starter template ("To get started, edit page.tsx... Deploy Now").
  - **Fix**: Inspect user session using Better Auth: redirect authenticated users to `/dashboard` and unauthenticated visitors to `/login` (or render a dedicated marketing landing page).

- [x] **Fix Calendar Hook Initial Load & Sync Fallback Order**
  - **Location**: [`hooks/use-calendar.ts#L252-L258`](file:///Users/shauryagupta/Dev/Projects/command-inbox/hooks/use-calendar.ts#L252-L258)
  - **Problem**: In `useCalendarEvents`, `syncFromApi()` is called before `fetchFromDb()`. Because `syncFromApi` swallows exceptions internally, the `catch` block that triggers `fetchFromDb()` never runs. If calendar sync fails or the network is slow, cached DB events are never rendered on initial mount.
  - **Fix**: Mirror the pattern in [`hooks/use-gmail.ts`](file:///Users/shauryagupta/Dev/Projects/command-inbox/hooks/use-gmail.ts): load cached DB events immediately on mount for 0ms initial render, then trigger background sync.

- [ ] **Implement Real Backend Endpoints for UI Actions (Replace Alerts & Mocks)**
  - **Location 1**: [`app/dashboard/inbox/page.tsx#L247-L252`](file:///Users/shauryagupta/Dev/Projects/command-inbox/app/dashboard/inbox/page.tsx#L247-L252) (`handleSendReply` displays browser `alert("Reply sent...")`).
  - **Location 2**: [`components/calendar/new-event-form.tsx#L21-L39`](file:///Users/shauryagupta/Dev/Projects/command-inbox/components/calendar/new-event-form.tsx#L21-L39) (Hardcodes `day: 3, startH: 9.0, endH: 10.0` and only mutates local state).
  - **Problem**: Neither feature has a backing server route; replies cannot be sent nor calendar events created from the UI.
  - **Fix**: Create `POST /api/gmail/messages/send` (or thread reply) and `POST /api/calendar/events` using Corsair plugin operations, and wire the UI components to these endpoints.

### 🟡 Medium Priority Fixes

- [ ] **Wire `FocusSection` and `NeedsAttention` into the Dashboard**
  - **Location**: [`components/dashboard/dashboard-view.tsx#L297-L309`](file:///Users/shauryagupta/Dev/Projects/command-inbox/components/dashboard/dashboard-view.tsx#L297-L309) and [`components/dashboard/default-workspace.tsx`](file:///Users/shauryagupta/Dev/Projects/command-inbox/components/dashboard/default-workspace.tsx)
  - **Problem**: `DashboardView` computes `dynamicFocusItems` and passes `focusItems` and `emails` to `DefaultWorkspace`. However, `DefaultWorkspace` ignores `focusItems`, and neither `FocusSection` nor `NeedsAttention` are rendered, leaving two high-value UI components completely orphaned.
  - **Fix**: Render `FocusSection` and `NeedsAttention` inside `DefaultWorkspace` below the main command area when no active chat is taking place, giving users immediate visibility over their pending tasks.

- [ ] **Fix Protected Route Matching in `proxy.ts`**
  - **Location**: [`proxy.ts#L45-L54`](file:///Users/shauryagupta/Dev/Projects/command-inbox/proxy.ts#L45-L54)
  - **Problem**: The proxy matcher protects `/dashboard/:path*`, `/connect/:path*`, `/api/gmail/:path*`, and `/api/integrations/:path*`, but omits `/api/calendar/:path*`, `/api/conversations/:path*`, and `/api/ai/:path*`.
  - **Fix**: Add `/api/calendar/:path*`, `/api/conversations/:path*`, and `/api/ai/:path*` to the proxy matcher to guard all private API routes at the proxy boundary.

- [ ] **Safeguard Social Auth Configuration in `lib/auth.ts`**
  - **Location**: [`lib/auth.ts#L20-L31`](file:///Users/shauryagupta/Dev/Projects/command-inbox/lib/auth.ts#L20-L31)
  - **Problem**: `apple`, `github`, and `gitlab` social providers use non-null assertions on environment variables (`process.env.APPLE_CLIENT_ID!`) that do not exist in `.env`, risking startup crashes in strict environments.
  - **Fix**: Only enable social providers conditionally if their credentials exist in `process.env`. Also add `APP_URL` to `.env.example`.

### 🟢 Code Quality & Lint Hygiene (Fix Failing `pnpm lint`)

- [ ] **Resolve React Compiler Cascading Render Violations**
  - **Location 1**: [`components/dashboard/sidebar.tsx#L1157`](file:///Users/shauryagupta/Dev/Projects/command-inbox/components/dashboard/sidebar.tsx#L1157): Avoid calling `setInternalCollapsed(true)` synchronously inside `useEffect`.
  - **Location 2**: [`components/inbox/email-thread-view.tsx#L31`](file:///Users/shauryagupta/Dev/Projects/command-inbox/components/inbox/email-thread-view.tsx#L31): Avoid calling `setIsLoadingBody(true)` synchronously inside `useEffect`.
- [ ] **Eliminate Explicit `any` Types & Unused Variables**
  - Replace `any` with strict TypeScript types across [`features/gmail/server.ts`](file:///Users/shauryagupta/Dev/Projects/command-inbox/features/gmail/server.ts) and [`lib/ai/agent.ts`](file:///Users/shauryagupta/Dev/Projects/command-inbox/lib/ai/agent.ts).
  - Remove unused variables: `firstName` in [`email-thread-view.tsx`](file:///Users/shauryagupta/Dev/Projects/command-inbox/components/inbox/email-thread-view.tsx), `now` in [`hooks/use-calendar.ts`](file:///Users/shauryagupta/Dev/Projects/command-inbox/hooks/use-calendar.ts), and unused `drizzle` in [`lib/auth.ts`](file:///Users/shauryagupta/Dev/Projects/command-inbox/lib/auth.ts).
  - Achieve clean exit code `0` on `pnpm lint`.

---

# 🗺️ Future Scope & Development Roadmap

Building on the foundation, the following phased milestones represent the future scope of Command Inbox:

## Phase 2 — Safe Write Actions & Bi-Directional Operations
Turn Command Inbox from an observation portal into a full command center:

- [ ] **Email Mutations**:
  - [ ] Reply directly to email threads with rich text or plain text.
  - [ ] Compose and send new emails to arbitrary recipients with validation.
  - [ ] Star / unstar email threads via Gmail API sync.
  - [ ] Archive email threads from the inbox.
  - [ ] Mark threads as read / unread with immediate DB cache updates.
- [ ] **Calendar Mutations**:
  - [ ] Create new calendar events with date/time pickers, location, description, and attendee invites.
  - [ ] Automatic Google Meet video conferencing link generation for new events.
  - [ ] Reschedule / edit existing events (time modifications with timezone awareness).
  - [ ] Delete / cancel events with confirmation dialogs.
- [ ] **Action Confirmation Guards**:
  - [ ] AI Assistant confirmation cards before sending emails or modifying meetings.
  - [ ] "Undo" snackbar for destructive actions (archive, delete).

---

## Phase 3 — Universal Cross-Service Search
A unified search layer that bridges silos across email, calendar, and future platforms:

- [ ] **Unified Query Parser**: Natural language queries that determine whether to search emails, events, or both (e.g., *"Find everything about Project Orion"*).
- [ ] **Hybrid Search Index**:
  - [ ] Full-text Postgres search (`tsvector` / `tsquery`) over email subjects, snippets, bodies, and calendar event summaries.
  - [ ] Semantic vector search using embeddings (e.g., pgvector) for concept-level retrieval.
- [ ] **Cross-Service Search UI**: Unified modal overlay (invoked via `⌘F` or top bar) displaying grouped results:
  - 📧 Matching Email Threads
  - 📅 Related Calendar Meetings
  - 👤 Relevant Contacts / Participants

---

## Phase 4 — Context-Aware Workspace Intelligence
Connecting relationships between disparate data sources:

- [ ] **Meeting Briefings**: Automatically link upcoming calendar meetings with recent related emails from participants.
- [ ] **Participant Dossiers**: View an attendee's recent email correspondence when clicking their avatar in a calendar event.
- [ ] **Smart Action Item Extraction**: AI scans unread emails and surfaces pending tasks, deadlines, and action items directly in the dashboard's "Needs Attention" panel.
- [ ] **Schedule Conflict & Availability Assistant**: Natural language commands like *"When am I free for a 45-minute call with Sarah this Thursday?"*.

---

## Phase 5 — Proactive Automations & Daily Briefings
Transform Command Inbox into an active personal productivity assistant:

- [ ] **Morning Daily Briefing**:
  - [ ] Scheduled summary generated every morning: today's meetings, urgent emails needing replies, and weather/schedule conflicts.
- [ ] **Automated Inbox Triage**:
  - [ ] Rule-based or AI-assisted labeling (e.g., *"Highlight emails from investors or university professors"*).
  - [ ] Auto-drafting responses for routine meeting confirmations or RSVPs.
- [ ] **Calendar Guardrails**:
  - [ ] Auto-block "Focus Time" periods when calendar density exceeds a user-defined threshold.
  - [ ] Warn when a meeting is scheduled without travel time or back-to-back without breaks.

---

## Phase 6 — Ecosystem Expansion (New Integrations)
Expanding beyond Gmail and Google Calendar to unite the modern digital workspace:

- [ ] **Slack Integration**:
  - [ ] Real-time DMs and mention notifications via Corsair.
  - [ ] Ability to send quick replies to Slack threads from Command Inbox.
- [ ] **GitHub Integration**:
  - [ ] Pull request review requests and issue notifications.
  - [ ] Natural language commands: *"Show PRs awaiting my review"*.
- [ ] **Notion / Linear Integration**:
  - [ ] Turn an email thread into a Linear ticket or Notion task with one click.
  - [ ] Bidirectional task status tracking.
- [ ] **Microsoft 365 / Outlook**:
  - [ ] Support Outlook email and Outlook calendar alongside Google Workspace.

---

## Phase 7 — Production Hardening, Privacy & Security
Ensuring enterprise-grade resilience, privacy, and compliance:

- [ ] **Token Lifecycle & Security**:
  - [ ] Automatic OAuth refresh token rotation and secure encryption at rest via KMS/KEK.
  - [ ] Zero raw token leakage in client bundles or logs.
- [ ] **Granular Scopes**:
  - [ ] Request minimal OAuth permissions (e.g., read-only by default, step-up auth for write operations).
- [ ] **Rate Limiting & Resiliency**:
  - [ ] Exponential backoff and retry policies for external provider APIs.
  - [ ] Redis / Upstash rate limiting on public API and AI endpoints.
- [ ] **Audit Trail**:
  - [ ] Audit log table recording every AI-triggered mutation (sent emails, modified events) with rollback capability.

---

## 🎯 Long-Term Vision

The ultimate vision for Command Inbox is:

> **A single AI command center that understands your digital workspace and helps you act across it.**

Instead of:

```text
Gmail → search
Calendar → check schedule
Notion → find notes
GitHub → check issue
Slack → search conversation
```

the experience becomes:

```text
              COMMAND INBOX

        "What's important today?"
                    ↓
        ┌──────────────────────┐
        │ AI understands       │
        │ the user's context   │
        └──────────┬───────────┘
                   ↓
       ┌───────────┼───────────┐
       ↓           ↓           ↓
     Gmail      Calendar     GitHub
       ↓           ↓           ↓
       └───────────┼───────────┘
                   ↓
             Unified Answer
```

The user should not need to think about **which application contains the information**.

They should only need to think about **what they want to accomplish**.

---

## 🔒 Security & Privacy Goals

As Command Inbox becomes more deeply integrated with users' services, security will become increasingly important.

Future work should include:

- Secure OAuth token handling
- Minimal required permissions
- Clear connected-account management
- Safe handling of sensitive email/calendar data
- Confirmation before destructive actions
- Strong authorization boundaries
- Secure webhook handling
- Audit logging for important actions
- Clear data retention policies

The application should always follow the principle of:

> **Only access what is necessary to perform the requested task.**

---

## 🧪 Development Philosophy

Command Inbox is being built incrementally:

```text
Build
 ↓
Connect to a real service
 ↓
Test with real data
 ↓
Fix the architecture
 ↓
Add the next capability
 ↓
Repeat
```

The priority is not to build every feature immediately.

The priority is to establish a strong foundation, ensure high reliability and zero-latency caching, and gradually turn it into something genuinely useful.

---

# 🤝 Contributing

Command Inbox is currently primarily a personal development project.

As the project matures, contribution guidelines, issue templates, and development documentation can be added here.

---

# 📜 License

License information will be added as the project approaches a public release.

---

## 🌱 From Prototype to Personal Command Center

Command Inbox started as an idea to bring productivity services together.

It is gradually becoming something more ambitious:

**an AI interface between the user and their digital world.**

The goal isn't to create another app that users have to constantly manage.

The goal is to make the user's existing tools **feel like one system**.

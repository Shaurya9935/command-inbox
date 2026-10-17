# Nexus

> **One command center for your digital life.**

Nexus is a production-hardened, AI-powered productivity workspace that unifies **Gmail** and **Google Calendar** into a single, intuitive interface. Instead of context-switching between tabs to locate threads, check availability, or organize schedules, Nexus provides a unified surface where users can **see, search, and act on their connected services through natural language**.

---

## 🚀 Key Highlights & Capabilities

- **Natural Language Command Center**: Powered by OpenAI Agents SDK with strict tool schemas. Search inbox threads, query calendar schedules, compose emails, and organize meetings from a single `⌘K` command bar.
- **Unified Email Workspace**: High-performance inbox with folder triage (Inbox, Starred, Drafts, Sent, Trash), unread badge counts, star toggling, and sanitized HTML email reading.
- **Multi-View Calendar**: Interactive scheduling with **Day**, **Week** (hourly grid with live time indicator), **Month**, and **Agenda** views, complete with attendee RSVP badges and Google Meet integration.
- **Zero-Latency Database Caching**: Reads are served instantly from local PostgreSQL tables with background incremental sync, bypassing external API rate limits.
- **Human-in-the-Loop Safety**: High-impact actions (sending emails, modifying or deleting calendar events) require explicit approval cards displaying real recipients, subjects, and full bodies before execution.
- **Production-Hardened Architecture**: Full tenant isolation, distributed serverless-safe sync locks, AES-256-GCM envelope encryption for OAuth tokens, prompt-injection guards, and strict spend protection.

---

## 🏗️ Architecture & Layering

Nexus follows a strict feature-based layered architecture designed for modularity, multi-tenant isolation, and high maintainability:

```text
┌─────────────────────────────────────────────────────────────┐
│                       Client Layer                          │
│   Next.js 16 (App Router) · React 19 · Semantic Design Tokens│
│   Dashboard · Unified Inbox · Multi-View Calendar · Connect │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    Proxy & Auth Boundary                    │
│   proxy.ts (Session Verification) · Better Auth 1.7         │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                      API Route Layer                        │
│   /api/ai · /api/gmail · /api/calendar · /api/conversations │
│   /api/integrations · /api/account · /api/webhooks · /api/mcp│
└──────┬───────────────────────┬───────────────────────┬──────┘
       │                       │                       │
┌──────▼──────┐         ┌──────▼──────┐         ┌──────▼──────┐
│  AI Engine  │         │ Feature Svc │         │  Data Layer │
│ OpenAI Agent│         │ Gmail Svc   │         │ PostgreSQL  │
│ Strict Tools│         │ Calendar Svc│         │ Drizzle ORM │
│ Instructions│         │ Account Svc │         │ Cache Tables│
└──────┬──────┘         └──────┬──────┘         └─────────────┘
       │                       │
┌──────▼───────────────────────▼──────┐
│       Corsair Integration Engine    │
│  Multi-Tenant SDK Client (withTenant)│
│  AES-256-GCM Envelope Encryption    │
│  Cautious Permissions Pipeline      │
└──────────────────┬──────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
  Google Gmail API    Google Calendar API
```

### Layering Rules
- **Routes & Handlers** (`app/api/*`): Parse requests, authenticate sessions via Better Auth, invoke services or the agent, and return sanitized, generic error responses.
- **AI Agent Runner** (`lib/ai/agent.ts`): Orchestrates prompt instructions, message history, tool execution, and approval queries.
- **AI Tools** (`features/<service>/ai-tools.ts`): Define deterministic Zod schemas (`strictTool`) and delegate all database queries and external mutations to the service layer. Tools never make direct external API calls.
- **Service Layer** (`features/<service>/server.ts`): Encapsulates all Corsair SDK operations, Drizzle ORM queries, and business logic. Functions accept `TenantCorsair` or session context and return strictly typed interfaces.
- **Integrations & Data Access** (`lib/corsair.ts`, `lib/db.ts`, `db/*`): Core SDK clients, database connection pool, and table schemas.

---

## 🛡️ Production Hardening & Security

Nexus has undergone end-to-end security hardening for hosted deployments:

### 1. Privacy-Preserving Logging
- Managed centrally through [`lib/logger.ts`](file:///Users/shauryagupta/Dev/Projects/command-inbox/lib/logger.ts) exporting `log.info`, `log.warn`, and `log.error`.
- Automatic redaction of sensitive keys: `body`, `raw`, `snippet`, `content`, `message`, `subject`, `to`, `from`, `description`, `attendees`, `access_token`, `refresh_token`, `authorization`, `cookie`, `password`.
- All logged strings are capped at 200 characters, and base64 email bodies are automatically stripped from error logs.
- Agent telemetry logs tool execution metadata (name, duration, success/failure, error class, token counts) rather than user emails or chat content.

### 2. Prompt-Injection Defenses & Safe Approvals
- **Untrusted Data Boundary**: Email bodies and calendar notes are explicitly designated as untrusted data in [`lib/ai/instructions.ts`](file:///Users/shauryagupta/Dev/Projects/command-inbox/lib/ai/instructions.ts). The assistant is instructed never to follow instructions contained within email or calendar content.
- **Minimal Model Tool Results**: Email list and search tools supply only necessary metadata (`threadId`, `from`, `subject`, `date`, and a 150-char snippet) to the model. Raw bodies and message headers are omitted.
- **Human-in-the-Loop Confirmation**: Corsair permissions are configured with `mode: "cautious"` and explicit overrides covering `messages.send`, `drafts.send`, `messages.delete`, `messages.trash`, `messages.modify`, `threads.modify`, `threads.delete`, `events.create`, `events.update`, and `events.delete` (including through generic scripts).
- **Comprehensive Approval Previews**: Approval cards render real recipients, subjects, and full message bodies for emails, and title, IST times, attendees, and locations for calendar events.
- **Input Validation Caps**: Maximum 5 recipients per email and maximum 10 attendees per calendar event are enforced at tool and API boundaries.

### 3. Strict Tenant Isolation
- User identities are derived strictly from verified Better Auth session cookies (`session.user.id`), never from request bodies or headers.
- All database queries across user-owned tables (`conversations`, `chat_messages`, `corsair_*`, `ai_usage`, `user_onboarding`) strictly filter by `userId` or `tenantId`.
- The Corsair client is always instantiated per-user via `corsair.withTenant(session.user.id)`.
- Conversation endpoints enforce ownership checks and return `404 Not Found` for unauthorized IDs.
- Webhooks ([`app/api/webhooks/route.ts`](file:///Users/shauryagupta/Dev/Projects/command-inbox/app/api/webhooks/route.ts)) and MCP endpoints ([`app/api/mcp/route.ts`](file:///Users/shauryagupta/Dev/Projects/command-inbox/app/api/mcp/route.ts)) verify secrets/signatures and strictly reject untrusted tenant IDs supplied by callers.

### 4. Serverless-Safe State & Distributed Sync Locks
- Zero harmful in-memory state: In-memory stores were eliminated in favor of database-backed persistence in `corsair_permissions`.
- Distributed sync locks (`acquireGmailSyncLock`, `acquireCalendarSyncLock`) with 2-minute TTLs and completion tracking prevent concurrent sync requests from duplicate processing across multiple serverless instances.

### 5. AI Spend Protection & Rate Limiting
- **Database Tracking**: Persistent `ai_usage` table records daily messages and token counts per user with atomic SQL upserts.
- **Message Caps**: Reject user messages exceeding 2,000 characters.
- **Burst Protection**: Limits users to 8 messages per minute.
- **Daily Message Limit**: Enforces a per-user daily cap (default: 50 messages/day).
- **Global Token Budget**: Evaluates aggregate daily token consumption across all users against `AI_DAILY_TOKEN_BUDGET_TOTAL` (default: 2,000,000 tokens/day) before applying soft caps.
- **Auth Rate Limiting**: Better Auth endpoints enforce rate limiting on sign-in (10/min) and sign-up (5/min).

### 6. Envelope Encryption at Rest
- User OAuth credentials (`access_token`, `refresh_token`, `expires_at`) are never stored in plaintext.
- Corsair provisions a distinct 32-byte Data Encryption Key (DEK) per account, which is encrypted using `scrypt` and AES-256-GCM via the master `CORSAIR_KEK` and stored in `corsair_accounts.dek`. Account configurations are encrypted using this DEK.

### 7. Security Headers & Error Handling
- Global security headers configured in [`next.config.ts`](file:///Users/shauryagupta/Dev/Projects/command-inbox/next.config.ts):
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `X-Frame-Options: DENY`
  - `Permissions-Policy: camera=(), geolocation=(), microphone=(self)`
- API routes catch exceptions, log full details internally, and return sanitized, generic error responses to clients (`{ error: "Something went wrong" }`).
- Application-wide error boundary ([`app/error.tsx`](file:///Users/shauryagupta/Dev/Projects/command-inbox/app/error.tsx)) and 404 handler ([`app/not-found.tsx`](file:///Users/shauryagupta/Dev/Projects/command-inbox/app/not-found.tsx)) adhere to semantic design tokens.

---

## 🎨 Theming & Semantic Design Tokens

All user interface styling strictly complies with semantic CSS variables (`var(--...)`) defined in [`app/globals.css`](file:///Users/shauryagupta/Dev/Projects/command-inbox/app/globals.css).

- **Warm Charcoal Dark Mode**: Dark mode is activated via `.dark` on `<html>` using warm charcoal neutrals (`#121110`, `#151412`, `#171614`, `#1D1C1A`, `#21201D`, `#252421`, `#EEEBE5`) and warm hairline borders, avoiding cold blues or stark pitch blacks.
- **Zero Hardcoded Colors**: No raw hex, `rgb()`, `rgba()`, or non-token Tailwind colors are permitted in components.
- **Guardrail Linter**: Run `pnpm check:colors` to automatically verify 100% adherence to design tokens.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router with Turbopack) & React 19
- **Language**: TypeScript 5 (Strict Mode)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth (with Drizzle PostgreSQL adapter)
- **Integration Layer**: Corsair SDK (`@corsair-dev/gmail`, `@corsair-dev/googlecalendar`, `@corsair-dev/mcp`)
- **AI / LLM Engine**: OpenAI Agents SDK & OpenAI API
- **Styling**: Tailwind CSS v4 & Semantic CSS Variables
- **Package Manager**: pnpm

---

## 🚦 Getting Started

### Prerequisites

- **Node.js**: v20.x or higher
- **pnpm**: v10.x or higher
- **PostgreSQL**: v15 or higher (local instance or cloud database like Neon, Supabase, RDS)
- **Google Cloud Console Project**: Configured for OAuth with Gmail and Google Calendar API scopes.
- **OpenAI API Key**: For AI assistant capabilities.

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/your-username/command-inbox.git
cd command-inbox
pnpm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Fill in your configuration values:

```dotenv
# App URL
APP_URL=http://localhost:3000

# Database
DATABASE_URL=postgres://postgres:postgres@localhost:5432/command-inbox

# Better Auth
BETTER_AUTH_SECRET=your-secure-auth-secret-min-32-chars
BETTER_AUTH_URL=http://localhost:3000

# Corsair Engine
CORSAIR_KEK=your-base64-encoded-32-byte-key
CORSAIR_DEV_API_KEY=ck_dev_your_api_key
CORSAIR_DEV_SIGNING_SECRET=your-signing-secret

# Google OAuth (Gmail & Google Calendar)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OpenAI Key
OPENAI_API_KEY=sk-proj-your-openai-api-key

# Spend Protection & Limits (Optional defaults provided)
AI_DAILY_MESSAGE_LIMIT=50
AI_BURST_MESSAGE_LIMIT=8
AI_DAILY_TOKEN_BUDGET_TOTAL=2000000

# Optional Webhook & MCP Secrets
WEBHOOK_SECRET=your-webhook-secret
MCP_SECRET=your-mcp-bearer-token
```

> [!NOTE]
> Environment variables are validated at startup with Zod via [`lib/env.ts`](file:///Users/shauryagupta/Dev/Projects/command-inbox/lib/env.ts). In production, missing required keys will trigger an immediate fail-fast error without leaking secret values.

### 3. Initialize Database & Run Migrations

```bash
# Run Drizzle migrations
pnpm db:migrate

# (Optional) Open Drizzle Studio to inspect database tables
pnpm db:studio
```

### 4. Start Development Server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to create an account, connect your Google services, and access your dashboard.

---

## 📦 Production Deployment

### 1. Build Verification

Verify that typechecking, linting, color tokens, and production bundling pass:

```bash
# Typecheck
npx tsc --noEmit

# Lint
pnpm lint

# Semantic token verification
pnpm check:colors

# Optimized Next.js production build
pnpm build
```

### 2. Start Production Server

```bash
pnpm start
```

### 3. Serverless & Containerized Environments

When deploying to Vercel, Railway, Render, or Docker:
1. Ensure `DATABASE_URL` connects to a pooled PostgreSQL instance.
2. Set `NODE_ENV=production` and `APP_URL=https://your-domain.com`.
3. Provide `CORSAIR_KEK`, `BETTER_AUTH_SECRET`, and OAuth secrets in your platform environment settings.
4. Run `pnpm db:migrate` in your deployment or release pipeline before starting web instances.

---

## 📋 Available Scripts

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Starts local Next.js development server with hot-reload |
| `pnpm build` | Compiles optimized production bundle using Turbopack |
| `pnpm start` | Boots production server |
| `pnpm lint` | Runs ESLint checks |
| `pnpm check:colors` | Scans codebase to enforce semantic design tokens and prevent hardcoded colors |
| `pnpm db:generate` | Generates new SQL migration files from Drizzle schema definitions |
| `pnpm db:migrate` | Applies pending Drizzle migrations to PostgreSQL database |
| `pnpm db:studio` | Launches visual Drizzle Studio database inspector |

---

## 🗺️ Roadmap & Future Scope

- [ ] **Cross-Platform Connectors**: Expand beyond Google Workspace to Microsoft 365 (Outlook), Slack, Notion, and GitHub.
- [ ] **Unified Cross-Service Search**: Hybrid vector search (`pgvector`) and full-text index across email threads, calendar events, and notes.
- [ ] **Proactive Morning Briefings**: Automated daily summaries of urgent emails, schedule density, and upcoming meetings.
- [ ] **Schedule Conflict Assistant**: Natural language availability queries (*"When am I free for a 45-minute call with Sarah on Thursday?"*).
- [ ] **Action Item Extraction**: Automatic detection of tasks and deadlines from unread correspondence surfaced directly to the dashboard.

---

## 📜 License

Private beta — all rights reserved.

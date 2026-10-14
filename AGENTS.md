<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Architecture

## Layering Rule
Code in this codebase follows a strict feature-based layered architecture:
- **Routes & Handlers** (`app/api/*`): Parse request, authenticate session, invoke agent/services, format response.
- **AI Agent Runner** (`lib/ai/agent.ts`): Orchestrates prompt instructions, history formatting, tool invocation, and pending actions querying. Target ≤120 lines.
- **AI Tools** (`features/<service>/ai-tools.ts`): Define deterministic schemas (`strictTool`) and execute handlers. **AI tools must NOT contain raw Corsair API calls or Drizzle queries directly.** Instead, tools delegate all data retrieval and mutation to the feature's service layer.
- **Service Layer** (`features/<service>/server.ts`): Encapsulates all Corsair SDK operations, Drizzle ORM cache queries, and business logic. Functions accept `TenantCorsair` or session context and return typed result interfaces.
- **Integrations & Data Access** (`lib/corsair.ts`, `lib/db.ts`, `db/*`): Core SDK clients, database connection pool, and table schemas.

## Adding New Integrations
When adding a new integration (e.g., Slack, Notion):
1. Add service functions in `features/<service>/server.ts`.
2. Define the tool schemas and delegates in `features/<service>/ai-tools.ts`.
3. Register the tools with a single line in `lib/ai/tools/index.ts`:
   ```ts
   export function buildTools(ctx: ToolContext): Tool<unknown>[] {
     return [
       ...gmailTools(ctx),
       ...calendarTools(ctx),
       ...newServiceTools(ctx),
     ];
   }
   ```


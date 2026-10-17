import "dotenv/config";

import { createCorsair } from "corsair";
import { gmail } from "@corsair-dev/gmail";
import { googlecalendar } from "@corsair-dev/googlecalendar";
import { pool } from "./db";
import { env } from "./env";

export const corsair = createCorsair({
  kek: env.CORSAIR_KEK,
  database: pool,
  permissions: {
    timeout: "30m",
    onTimeout: "deny",
    mode: "asynchronous",
  },
  manual: {
    baseUrl: `${env.APP_URL}/connect`,
    redirectUri: `${env.APP_URL}/api/oauth/callback`,
    approvalBaseUrl: `${env.APP_URL}/approve`,
    onApprovalRequired: () =>
      "This action is waiting for the user's approval in the chat. Tell the user it is ready for approval. Do not retry.",
  },
  plugins: [
    gmail({
      permissions: {
        mode: "cautious",
        overrides: {
          "messages.send": "require_approval",
          "drafts.send": "require_approval",
          "messages.delete": "require_approval",
          "messages.trash": "require_approval",
          "messages.modify": "require_approval",
          "threads.modify": "require_approval",
          "threads.trash": "require_approval",
          "threads.delete": "require_approval",
        },
      },
    }),
    googlecalendar({
      permissions: {
        mode: "cautious",
        overrides: {
          "events.create": "require_approval",
          "events.update": "require_approval",
          "events.delete": "require_approval",
        },
      },
    }),
  ],
  multiTenancy: true,
});

export type TenantCorsair = ReturnType<typeof corsair.withTenant>;


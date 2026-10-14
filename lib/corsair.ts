import "dotenv/config";

import { createCorsair } from "corsair";
import { gmail } from "@corsair-dev/gmail";
import { googlecalendar } from "@corsair-dev/googlecalendar";
import { pool } from "./db";

export const corsair = createCorsair({
  kek: process.env.CORSAIR_KEK!,
  database: pool,
  permissions: {
    timeout: "30m",
    onTimeout: "deny",
    mode: "asynchronous",
  },
  manual: {
    baseUrl: `${process.env.APP_URL || "http://localhost:3000"}/connect`,
    redirectUri: `${process.env.APP_URL || "http://localhost:3000"}/api/oauth/callback`,
    approvalBaseUrl: `${process.env.APP_URL || "http://localhost:3000"}/approve`,
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
        },
      },
    }),
    googlecalendar({
      permissions: {
        mode: "cautious",
        overrides: {
          "events.create": "require_approval",
        },
      },
    }),
  ],
  multiTenancy: true,
});

export type TenantCorsair = ReturnType<typeof corsair.withTenant>;


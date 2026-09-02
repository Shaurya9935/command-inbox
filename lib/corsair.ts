import "dotenv/config";

import { createCorsair } from "corsair";
import { gmail } from "@corsair-dev/gmail";
import { googlecalendar } from "@corsair-dev/googlecalendar";
import { pool } from "./db";

export const corsair = createCorsair({
  kek: process.env.CORSAIR_KEK!,
  database: pool,
  manual: {
    baseUrl: `${process.env.APP_URL || "http://localhost:3000"}/connect`,
    redirectUri: `${process.env.APP_URL || "http://localhost:3000"}/api/oauth/callback`,
  },
  plugins: [gmail(), googlecalendar()],
  multiTenancy: true,
});

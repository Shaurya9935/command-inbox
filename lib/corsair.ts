import 'dotenv/config';

import { createCorsair } from 'corsair';
import { gmail } from '@corsair-dev/gmail';
import { googlecalendar } from '@corsair-dev/googlecalendar';
import { pool } from '../lib/db';

export const corsair = createCorsair({
  kek: process.env.CORSAIR_KEK!,
  database: pool, // your app's database instance
  hub: {
    projectApiKey: process.env.CORSAIR_DEV_API_KEY!,
    signingSecret: process.env.CORSAIR_DEV_SIGNING_SECRET!,
  },
  plugins: [
    gmail(),
    googlecalendar()
  ],
});
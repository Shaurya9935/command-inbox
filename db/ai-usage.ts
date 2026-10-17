import { pgTable, text, date, integer, timestamp, uniqueIndex, index } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const aiUsage = pgTable(
  "ai_usage",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    day: date("day").notNull(),
    messages: integer("messages").notNull().default(0),
    tokensIn: integer("tokens_in").notNull().default(0),
    tokensOut: integer("tokens_out").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("ai_usage_user_id_day_idx").on(table.userId, table.day),
    index("ai_usage_day_idx").on(table.day),
  ]
);

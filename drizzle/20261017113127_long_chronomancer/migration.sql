CREATE TABLE IF NOT EXISTS "user_onboarding" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"completed_at" timestamp with time zone,
	"skipped_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ai_usage" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"day" date NOT NULL,
	"messages" integer DEFAULT 0 NOT NULL,
	"tokens_in" integer DEFAULT 0 NOT NULL,
	"tokens_out" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_onboarding_user_id_idx" ON "user_onboarding" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "ai_usage_user_id_day_idx" ON "ai_usage" ("user_id","day");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ai_usage_day_idx" ON "ai_usage" ("day");--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_onboarding_user_id_user_id_fkey') THEN
    ALTER TABLE "user_onboarding" ADD CONSTRAINT "user_onboarding_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;
  END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ai_usage_user_id_user_id_fkey') THEN
    ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;
  END IF;
END $$;